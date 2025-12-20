const Order = require('../models/Order');
const User = require('../models/User');
const Item = require('../models/Item');

/**
 * Build a fully populated order object with item snapshots and buyer info.
 */
async function transformOrder(order) {
  const orderObj = order.toObject ? order.toObject() : order;
  const items = Array.isArray(orderObj.items) ? orderObj.items : [];

  const itemIds = items
    .map((i) => i.itemId || i.productId || i._id || i.id)
    .filter(Boolean);
  const dbItems = itemIds.length
    ? await Item.find({ _id: { $in: itemIds } }).select('price title images image')
    : [];
  const dbIndex = new Map(dbItems.map((d) => [d._id.toString(), d]));

  const totalQty = items.reduce(
    (sum, it) =>
      sum +
      (Number(it.quantity) ||
        Number(it.qty) ||
        Number(it.count) ||
        0),
    0
  );

  const itemsWithPrice = items.map((itm, idx) => {
    const lookupId =
      itm.itemId || itm.productId || itm._id || itm.id;
    const match = lookupId ? dbIndex.get(String(lookupId)) : null;
    const qty =
      Number(itm.quantity) ||
      Number(itm.qty) ||
      Number(itm.count) ||
      0 ||
      1;
    const lineTotal =
      Number(itm.lineTotal) ||
      Number(itm.subtotal) ||
      Number(itm.total) ||
      0;
    const priceFromDb = match ? Number(match.price) || 0 : 0;
    const priceAtOrder =
      Number(itm.priceAtOrder) ||
      Number(itm.price) ||
      Number(itm.unitPrice) ||
      Number(itm.pricePerUnit) ||
      Number(itm.amount) ||
      Number(itm.item?.price) ||
      Number(itm.product?.price) ||
      priceFromDb ||
      (lineTotal && qty ? lineTotal / qty : 0) ||
      (orderObj.totalPrice && totalQty
        ? Number(orderObj.totalPrice) / totalQty
        : 0);

    const name =
      itm.name ||
      itm.title ||
      itm.itemName ||
      itm.productName ||
      itm.displayName ||
      itm.item?.title ||
      itm.product?.title ||
      (match ? match.title : null) ||
      'Unknown Item';

    return {
      ...itm,
      itemId: lookupId || itm.itemId,
      name,
      price: priceAtOrder,
      priceAtOrder,
      priceFromDb,
      images: match?.images || itm.images,
      image: match?.image || itm.image,
      quantity: qty,
    };
  });

  const recalcedTotal =
    typeof orderObj.totalPrice === 'number'
      ? orderObj.totalPrice
      : Math.round(
          (itemsWithPrice.reduce(
            (sum, it) => sum + (Number(it.price) || 0) * (it.quantity || 0),
            0
          ) +
            Number.EPSILON) *
            100
        ) / 100;

  let buyerInfo = {
    name: 'Unknown Buyer',
    email: '',
    phone: '',
  };
  let sellerInfo = {
    name: 'Unknown Seller',
    email: '',
    phone: '',
  };

  if (orderObj.buyerId) {
    try {
      const buyer = await User.findById(orderObj.buyerId).select(
        'name email phone'
      );
      if (buyer) {
        buyerInfo.name = buyer.name || buyer.email || 'Unknown Buyer';
        buyerInfo.email = buyer.email || '';
        buyerInfo.phone = buyer.phone || '';
      }
    } catch (err) {
      console.warn('Could not fetch buyer:', err.message);
    }
  }
  if (orderObj.sellerId) {
    try {
      const seller = await User.findById(orderObj.sellerId).select(
        'name email phone'
      );
      if (seller) {
        sellerInfo.name = seller.name || seller.email || 'Unknown Seller';
        sellerInfo.email = seller.email || '';
        sellerInfo.phone = seller.phone || '';
      }
    } catch (err) {
      console.warn('Could not fetch seller:', err.message);
    }
  }

  return {
    ...orderObj,
    items: itemsWithPrice,
    totalPrice: recalcedTotal,
    buyerName: buyerInfo.name,
    buyerEmail: buyerInfo.email,
    buyerPhone: buyerInfo.phone,
    sellerName: sellerInfo.name,
    sellerEmail: sellerInfo.email,
    sellerPhone: sellerInfo.phone,
  };
}

/**
 * Build normalized item snapshots from payload and DB values.
 */
async function buildItemSnapshots(itemsPayload = []) {
  const itemIds = itemsPayload
    .map((i) => i.itemId || i.productId || i._id || i.id)
    .filter(Boolean);
  const dbItems = itemIds.length
    ? await Item.find({ _id: { $in: itemIds } }).select('price title')
    : [];
  const dbIndex = new Map(dbItems.map((d) => [d._id.toString(), d]));

  return itemsPayload.map((orderItem, idx) => {
    const lookupId =
      orderItem.itemId || orderItem.productId || orderItem._id || orderItem.id;
    const match = lookupId ? dbIndex.get(String(lookupId)) : null;
    const qty = Number(orderItem.quantity) || Number(orderItem.qty) || 0;
    const priceAtOrder =
      match ? Number(match.price) || 0 : Number(orderItem.price) || Number(orderItem.unitPrice) || 0;

    return {
      itemId: lookupId,
      quantity: qty,
      price: priceAtOrder,
      priceAtOrder,
      name: match?.title || orderItem.name || orderItem.productName || orderItem.title || `Item ${idx + 1}`,
    };
  });
}

function computeTotal(itemsSnapshot = []) {
  return Math.round(
    (itemsSnapshot.reduce(
      (sum, it) => sum + (Number(it.priceAtOrder) || 0) * (it.quantity || 0),
      0
    ) +
      Number.EPSILON) *
      100
  ) / 100;
}

module.exports = {
  transformOrder,
  buildItemSnapshots,
  computeTotal,
};
