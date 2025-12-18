const Flag = require('../models/Flag');
const User = require('../models/User');

// Compute lock duration based on strike count (progressive)
function computeLockDuration(strikes, baseDays, maxDays) {
  const days = Math.min(baseDays * Math.pow(2, Math.max(strikes - 1, 0)), maxDays);
  return days;
}

async function enforceFlagPolicy(userId, role, options = {}) {
  if (!userId) return null;
  const {
    windowDays = Number(process.env.FLAG_WINDOW_DAYS) || 30,
    buyerThreshold = Number(process.env.FLAG_THRESHOLD_BUYER) || 3,
    sellerThreshold = Number(process.env.FLAG_THRESHOLD_SELLER) || 3,
    baseLockDays = Number(process.env.FLAG_BASE_LOCK_DAYS) || 2,
    maxLockDays = Number(process.env.FLAG_MAX_LOCK_DAYS) || 60,
    autoUnlockOnResolve = (process.env.AUTO_UNLOCK_ON_RESOLVE || 'true') === 'true'
  } = options;

  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  const activeFlags = await Flag.countDocuments({
    flaggedUserId: userId,
    flaggedUserRole: role,
    status: { $ne: 'dismissed' },
    createdAt: { $gte: since }
  });

  const threshold = role === 'seller' ? sellerThreshold : buyerThreshold;
  const user = await User.findById(userId);
  if (!user) return null;

  // Auto-unlock when below threshold and current lock expired
  const now = new Date();
  if (autoUnlockOnResolve && user.flagLock?.locked) {
    const lockExpired = user.flagLock.until && user.flagLock.until <= now;
    if (activeFlags < threshold && lockExpired) {
      user.isActive = true;
      user.flagLock = { locked: false, reason: '', since: null, until: null, strikes: user.flagLock.strikes || 0 };
      await user.save();
      return { locked: false, count: activeFlags, unlocked: true };
    }
  }

  // Apply lock if threshold hit
  if (activeFlags >= threshold) {
    const strikes = (user.flagLock?.strikes || 0) + 1;
    const durationDays = computeLockDuration(strikes, baseLockDays, maxLockDays);
    const until = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    user.isActive = false;
    user.flagLock = {
      locked: true,
      reason: `Exceeded ${threshold} flags in ${windowDays} days`,
      since: now,
      until,
      strikes,
      lastReviewedAt: now
    };
    await user.save();
    return { locked: true, count: activeFlags, until, strikes };
  }

  return { locked: user.flagLock?.locked || false, count: activeFlags };
}

module.exports = { enforceFlagPolicy };
