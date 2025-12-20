const Flag = require('../models/Flag');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const { enforceFlagPolicy } = require('../utils/flagsEnforcer');

async function deriveIdsFromOrder(orderId, payload) {
  if (!orderId) return payload;

  try {
    const order = await Order.findById(orderId).select('buyerId sellerId');
    if (!order) return payload;

    if (!payload.flaggedUserId) {
      if (payload.flaggedUserRole === 'buyer') payload.flaggedUserId = order.buyerId;
      if (payload.flaggedUserRole === 'seller') payload.flaggedUserId = order.sellerId;
    }
    if (!payload.createdByUserId && payload.flaggedUserRole === 'buyer') {
      payload.createdByUserId = order.sellerId;
    }
    if (!payload.createdByUserId && payload.flaggedUserRole === 'seller') {
      payload.createdByUserId = order.buyerId;
    }
  } catch (err) {
    console.warn('Could not derive IDs from order', orderId, err.message);
  }

  return payload;
}

exports.createFlag = async (req, res) => {
  try {
    const payload = {
      status: 'pending',
      flaggedUserRole: req.body.flaggedUserRole || 'buyer',
      ...req.body,
    };

    if (payload.orderId) {
      await deriveIdsFromOrder(payload.orderId, payload);
    }

    if (payload.orderId && !payload.itemId) {
      return res.status(400).json({ message: 'itemId is required for order flags' });
    }

    if (payload.orderId && payload.itemId && payload.createdByUserId) {
      const existing = await Flag.findOne({
        orderId: payload.orderId,
        itemId: payload.itemId,
        createdByUserId: payload.createdByUserId,
      }).select('_id');
      if (existing) {
        return res.status(409).json({ message: 'This product in this order has already been flagged.' });
      }
    }

    payload.updatedAt = new Date();

    const f = new Flag(payload);
    await f.save();
    try { await enforceFlagPolicy(f.flaggedUserId, f.flaggedUserRole); } catch (e) { console.warn('Policy enforcement failed:', e.message); }
    try {
      if (f.flaggedUserId) {
        const flaggedUser = await User.findById(f.flaggedUserId).select('email name');
        if (flaggedUser?.email) {
          const subject = 'Your account received a flag';
          const text = `Your account has been flagged.${f.reason ? `\n\nReason: ${f.reason}` : ''}`;
          const html = `
            <div style="font-family: Arial, sans-serif; color: #111827; background: #f9fafb; padding: 24px;">
              <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
                <h2 style="margin: 0 0 12px; font-size: 18px;">Account flag notice</h2>
                <p style="margin: 0 0 10px; font-size: 14px; color: #374151;">
                  Your account has been flagged.
                </p>
                ${f.reason ? `<p style="margin: 0; font-size: 13px; color: #6b7280;">Reason: ${f.reason}</p>` : ''}
              </div>
            </div>
          `;
          await sendEmail({ to: flaggedUser.email, subject, text, html });
        }
      }
    } catch (err) {
      console.error('Flag email failed:', err.message);
    }
    res.status(201).json(f);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
};

exports.listFlags = async (req, res) => {
  try {
    const { flaggedUserId, createdByUserId, flaggedUserRole, orderId, status, storeId } = req.query;
    const filter = {};

    if (flaggedUserId) filter.flaggedUserId = flaggedUserId;
    if (createdByUserId) filter.createdByUserId = createdByUserId;
    if (flaggedUserRole) filter.flaggedUserRole = flaggedUserRole;
    if (orderId) filter.orderId = orderId;
    if (status) filter.status = status;

    if (storeId) {
      filter.$or = [
        { flaggedUserId: storeId },
        { createdByUserId: storeId }
      ];
    }

    const query = Flag.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('orderId', 'orderNo status buyerId sellerId placedAt')
      .populate('flaggedUserId', 'name email')
      .populate('createdByUserId', 'name email');

    const flags = await query;
    res.json(flags);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
};

exports.updateFlagStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const flag = await Flag.findById(req.params.id);
    if (!flag) return res.status(404).json({ message: 'Not found' });

    if (status) flag.status = status;
    if (adminNotes !== undefined) flag.adminNotes = adminNotes;
    flag.updatedAt = new Date();

    await flag.save();
    try { await enforceFlagPolicy(flag.flaggedUserId, flag.flaggedUserRole); } catch (e) { console.warn('Policy enforcement failed:', e.message); }
    res.json(flag);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Bad request' });
  }
};
