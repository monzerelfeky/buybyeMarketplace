const Item = require('../models/Item');
const Order = require('../models/Order');

/**
 * Recalculate totalPrice for all orders containing the given item.
 */
async function recalcOrdersForItem(itemId) {
  try {
    const orders = await Order.find({ 'items.itemId': itemId });
    if (!orders || orders.length === 0) return;

    for (const order of orders) {
      const itemIds = order.items.map((i) => i.itemId);
      const dbItems = await Item.find({ _id: { $in: itemIds } }).select('price');

      let totalPrice = 0;
      order.items.forEach((orderItem) => {
        const match = dbItems.find((d) => d._id.toString() === (orderItem.itemId || '').toString());
        const qty = Number(orderItem.quantity) || 0;
        const price = match ? Number(match.price) || 0 : 0;
        totalPrice += price * qty;
      });

      order.totalPrice = Math.round((totalPrice + Number.EPSILON) * 100) / 100;
      order.updatedAt = new Date();
      await order.save();
      console.debug(`Recalculated order ${order._id} totalPrice -> ${order.totalPrice}`);
    }
  } catch (err) {
    console.error('Failed to recalc orders for item', itemId, err.message);
  }
}

module.exports = {
  recalcOrdersForItem,
};
