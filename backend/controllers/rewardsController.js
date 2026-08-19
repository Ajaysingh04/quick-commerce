import User from '../models/User.js';
import Coupon from '../models/Coupon.js';

// Spin & Win rewards list
const SPIN_PRIZES = [
  { type: 'discount', label: '10% OFF', code: 'SPIN10', val: 10 },
  { type: 'free_delivery', label: 'Free Delivery', code: 'SPINFREE', val: 0 },
  { type: 'coins', label: '50 Coins', code: '', val: 50 },
  { type: 'coins', label: '100 Coins', code: '', val: 100 },
  { type: 'cashback', label: '15% Cashback', code: 'SPINCB', val: 15 }
];

export const spinWheel = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check 24 hour cooldown
    const now = new Date();
    if (user.loyalty.lastSpin) {
      const diffMs = now - new Date(user.loyalty.lastSpin);
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours < 24) {
        const timeRemaining = 24 - diffHours;
        const hours = Math.floor(timeRemaining);
        const mins = Math.floor((timeRemaining - hours) * 60);
        return res.status(400).json({
          success: false,
          message: `You have already spun the wheel today. Try again in ${hours}h ${mins}m.`
        });
      }
    }

    // Pick a random reward index
    const randomIndex = Math.floor(Math.random() * SPIN_PRIZES.length);
    const prize = SPIN_PRIZES[randomIndex];

    // Apply the prize to user profile
    if (prize.type === 'coins') {
      user.loyalty.coins += prize.val;
    } else {
      // Create a coupon code in database dynamically if it doesn't exist
      const checkCoupon = await Coupon.findOne({ code: prize.code });
      if (!checkCoupon) {
        await Coupon.create({
          code: prize.code,
          discountPercent: prize.val > 0 ? prize.val : 10,
          isActive: true,
          minOrderValue: 200,
          description: `Spin & Win special reward: ${prize.label}`
        });
      }
    }

    // Unlock badge for spinning the wheel
    if (!user.loyalty.badges.includes('Lucky Spinner')) {
      user.loyalty.badges.push('Lucky Spinner');
    }

    // Update level based on coins
    updateLoyaltyLevel(user);

    user.loyalty.lastSpin = now;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Congratulations! You won: ${prize.label}`,
      prize,
      loyalty: user.loyalty
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRewardsInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Dynamic level calculations just in case
    updateLoyaltyLevel(user);
    await user.save();

    res.status(200).json({
      success: true,
      loyalty: user.loyalty
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to update level
const updateLoyaltyLevel = (user) => {
  const coins = user.loyalty.coins;
  if (coins >= 1000) {
    user.loyalty.level = 'Platinum';
    if (!user.loyalty.badges.includes('Platinum Club')) {
      user.loyalty.badges.push('Platinum Club');
    }
  } else if (coins >= 500) {
    user.loyalty.level = 'Gold';
    if (!user.loyalty.badges.includes('Gold VIP')) {
      user.loyalty.badges.push('Gold VIP');
    }
  } else if (coins >= 200) {
    user.loyalty.level = 'Silver';
    if (!user.loyalty.badges.includes('Silver Rising')) {
      user.loyalty.badges.push('Silver Rising');
    }
  } else {
    user.loyalty.level = 'Bronze';
  }
};
