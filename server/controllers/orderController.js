const Order = require('../models/Order');
const Item = require('../models/Item');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const {
  transformOrder,
  buildItemSnapshots,
  computeTotal,
} = require('../services/orderService');

// GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const { sellerId, seller, buyerId } = req.query;
    const filter = {};
    if (sellerId || seller) {
      filter.sellerId = sellerId || seller;
    }
    if (buyerId) {
      filter.buyerId = buyerId;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200);
    const transformed = await Promise.all(orders.map(transformOrder));
    res.json(transformed);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
};

// GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    const transformed = await transformOrder(order);
    res.json(transformed);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
};

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { buyerId, sellerId, items = [], deliveryAddress, buyerNotes } = req.body;

    const itemsSnapshot = await buildItemSnapshots(items);
    const totalPrice = computeTotal(itemsSnapshot);

    const updatedItems = [];
    try {
      for (const entry of itemsSnapshot) {
        const itemId = entry.itemId;
        const qty = Number(entry.quantity) || 0;
        if (!itemId || qty < 1) {
          throw new Error('Invalid item payload');
        }
        const updated = await Item.findOneAndUpdate(
          { _id: itemId, quantity: { $gte: qty } },
          { $inc: { quantity: -qty } },
          { new: true }
        ).select('_id quantity');
        if (!updated) {
          throw new Error('Insufficient stock');
        }
        updatedItems.push({ itemId, qty });
      }
    } catch (err) {
      for (const entry of updatedItems) {
        await Item.updateOne({ _id: entry.itemId }, { $inc: { quantity: entry.qty } });
      }
      return res.status(400).json({ message: err.message || 'Insufficient stock' });
    }

    const order = await Order.create({
      buyerId,
      sellerId,
      items: itemsSnapshot,
      totalPrice,
      deliveryAddress,
      buyerNotes,
      placedAt: new Date(),
    });

    const transformed = await transformOrder(order);
    try {
      const [seller, buyer] = await Promise.all([
        User.findById(sellerId).select('email name'),
        User.findById(buyerId).select('email name phone'),
      ]);
      if (seller?.email) {
        const orderRef = order.orderNo || order._id;
        const formatCurrency = (value) => `EGP ${Number(value || 0).toLocaleString()}`;
        const lineItems = itemsSnapshot.map((item) => {
          const qty = Number(item.quantity) || 0;
          const price = Number(item.priceAtOrder || item.price) || 0;
          const lineTotal = qty * price;
          return {
            name: item.name || 'Item',
            qty,
            price,
            lineTotal,
          };
        });
        const total = computeTotal(itemsSnapshot);
        const addressLines = deliveryAddress
          ? [
              deliveryAddress.fullName || deliveryAddress.name,
              deliveryAddress.phone,
              deliveryAddress.addressLine1 || deliveryAddress.address1,
              deliveryAddress.addressLine2 || deliveryAddress.address2,
              deliveryAddress.city,
              deliveryAddress.state,
              deliveryAddress.country,
              deliveryAddress.postalCode || deliveryAddress.zip,
            ].filter(Boolean)
          : [];
        const textLines = lineItems
          .map(
            (item) =>
              `- ${item.name} x${item.qty} @ ${formatCurrency(item.price)} = ${formatCurrency(item.lineTotal)}`
          )
          .join('\n');
        const subject = `New order ${orderRef}`;
        const text = `You received a new order (${orderRef}).\n\nBuyer:\n${buyer?.name || ''}\n${buyer?.email || ''}\n${buyer?.phone || ''}\n\nDelivery address:\n${addressLines.join('\n')}\n\nItems:\n${textLines}\n\nTotal: ${formatCurrency(total)}`;
        const htmlRows = lineItems
          .map(
            (item) => `
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.qty}</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price)}</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.lineTotal)}</td>
              </tr>`
          )
          .join('');
        const buyerHtml = `
          <div style="margin-bottom: 16px; font-size: 13px; color: #374151;">
            <strong>Buyer</strong><br />
            ${buyer?.name || ''}${buyer?.name && buyer?.email ? ' - ' : ''}${buyer?.email || ''}<br />
            ${buyer?.phone || ''}
          </div>
        `;
        const addressHtml = addressLines.length
          ? `
            <div style="margin-bottom: 16px; font-size: 13px; color: #374151;">
              <strong>Delivery address</strong><br />
              ${addressLines.join('<br />')}
            </div>
          `
          : '';
        const html = `
          <div style="font-family: Arial, sans-serif; color: #111827; background: #f9fafb; padding: 24px;">
            <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
              <h2 style="margin: 0 0 12px; font-size: 18px;">New order placed</h2>
              <p style="margin: 0 0 16px; font-size: 14px; color: #374151;">
                You received a new order <strong>${orderRef}</strong>.
              </p>
              ${buyerHtml}
              ${addressHtml}
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #374151;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">Item</th>
                    <th style="text-align: center; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">Qty</th>
                    <th style="text-align: right; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">Unit</th>
                    <th style="text-align: right; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  ${htmlRows}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding-top: 12px; text-align: right; font-weight: 600;">Total</td>
                    <td style="padding-top: 12px; text-align: right; font-weight: 600;">${formatCurrency(total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        `;
        await sendEmail({ to: seller.email, subject, text, html });
      }
    } catch (err) {
      console.error('New order email failed:', err.message);
    }
    res.status(201).json(transformed);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Could not create order' });
  }
};

// PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    const prevStatus = order.status;
    if (status === 'Cancelled' && prevStatus !== 'Cancelled') {
      const restocks = (order.items || [])
        .map((item) => ({
          itemId: item.itemId,
          qty: Number(item.quantity) || 0,
        }))
        .filter((entry) => entry.itemId && entry.qty > 0);
      try {
        await Promise.all(
          restocks.map((entry) =>
            Item.updateOne(
              { _id: entry.itemId },
              { $inc: { quantity: entry.qty } }
            )
          )
        );
      } catch (err) {
        console.error('Restock failed for cancelled order:', err.message);
        return res.status(400).json({ message: 'Failed to restock items' });
      }
    }
    order.status = status;
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({ status, changedAt: new Date(), note });
    order.updatedAt = new Date();
    await order.save();
    const transformed = await transformOrder(order);
    try {
      const [buyer, seller] = await Promise.all([
        User.findById(order.buyerId).select('email name'),
        User.findById(order.sellerId).select('email name'),
      ]);
      const recipients = [buyer?.email, seller?.email].filter(Boolean);
      if (recipients.length > 0) {
        const subject = `Order ${order.orderNo || order._id} status: ${status}`;
        const text = `Order ${order.orderNo || order._id} status changed to ${status}.${
          note ? `\n\nNote: ${note}` : ''
        }`;
        const html = `
          <div style="font-family: Arial, sans-serif; color: #111827; background: #f9fafb; padding: 24px;">
            <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
              <h2 style="margin: 0 0 12px; font-size: 18px;">Order status update</h2>
              <p style="margin: 0 0 10px; font-size: 14px; color: #374151;">
                Order <strong>${order.orderNo || order._id}</strong> is now
                <strong>${status}</strong>.
              </p>
              ${note ? `<p style="margin: 0; font-size: 13px; color: #6b7280;">Note: ${note}</p>` : ''}
            </div>
          </div>
        `;
        await Promise.all(
          recipients.map((to) => sendEmail({ to, subject, text, html }))
        );
      }
    } catch (err) {
      console.error('Order status email failed:', err.message);
    }
    res.json(transformed);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
};

// PATCH /api/orders/:id
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });

    console.debug('Updating order', req.params.id, 'with fields:', Object.keys(req.body));

    if (req.body.items) {
      const itemsPayload = Array.isArray(req.body.items) ? req.body.items : [];
      const normalizedItems = await buildItemSnapshots(itemsPayload);
      const totalPrice = computeTotal(normalizedItems);
      order.items = normalizedItems;
      order.totalPrice = totalPrice;
    }

    const updatable = ['deliveryAddress', 'buyerNotes', 'deliveryNotes', 'payment', 'trackingNo', 'orderNo', 'status'];
    updatable.forEach((k) => {
      if (req.body[k] !== undefined) order[k] = req.body[k];
    });

    order.updatedAt = new Date();
    await order.save();
    const transformed = await transformOrder(order);
    res.json(transformed);
  } catch (err) {
    console.error('Order update error:', err.message);
    res.status(400).json({ message: 'Bad request' });
  }
};
