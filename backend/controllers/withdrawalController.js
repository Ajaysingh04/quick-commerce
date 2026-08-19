import Withdrawal from '../models/Withdrawal.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// @desc    Request a withdrawal (Delivery Partner)
// @route   POST /api/withdrawals
// @access  Private (Delivery)
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, bankName, accountHolderName, accountNumber, ifscCode } = req.body;
    
    if (!amount || !bankName || !accountHolderName || !accountNumber || !ifscCode) {
      return res.status(400).json({ message: 'All bank details are required' });
    }

    // Save bank details to user profile if not already there
    const user = await User.findById(req.user._id);
    if (user) {
      user.bankDetails = { bankName, accountHolderName, accountNumber, ifscCode };
      await user.save();
    }

    const withdrawal = await Withdrawal.create({
      deliveryPartner: req.user._id,
      amount,
      bankDetails: {
        bankName,
        accountHolderName,
        accountNumber,
        ifscCode
      }
    });

    res.status(201).json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to request withdrawal', error: error.message });
  }
};

// @desc    Get all withdrawals (Admin)
// @route   GET /api/withdrawals
// @access  Private (Admin)
export const getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('deliveryPartner', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch withdrawals', error: error.message });
  }
};

// @desc    Update withdrawal status (Admin)
// @route   PUT /api/withdrawals/:id/status
// @access  Private (Admin)
export const updateWithdrawalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal request not found' });
    }

    withdrawal.status = status;
    await withdrawal.save();

    res.status(200).json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update withdrawal', error: error.message });
  }
};

// @desc    Get delivery analytics for a partner (Admin)
// @route   GET /api/withdrawals/analytics/:partnerId
// @access  Private (Admin)
export const getWithdrawalAnalytics = async (req, res) => {
  try {
    const partnerId = req.params.partnerId;
    
    const orders = await Order.find({ deliveryPartner: partnerId, status: 'delivered' })
      .populate('store', 'name deliveryAddress.city deliveryAddress.street')
      .sort({ createdAt: -1 });

    let totalDeliveries = orders.length;
    let totalRevenue = 0;
    let totalPayout = 0; // Using deliveryFee as payout

    const deliveryDetails = orders.map(order => {
      totalRevenue += order.billDetails.grandTotal;
      totalPayout += order.billDetails.deliveryFee || 40;

      let timeTaken = 0;
      if (order.deliveredAt && order.createdAt) {
        timeTaken = Math.round((new Date(order.deliveredAt) - new Date(order.createdAt)) / 60000); // in minutes
      }

      return {
        orderId: order._id,
        storeName: order.store?.name || 'Unknown',
        customerAddress: `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`,
        amount: order.billDetails.grandTotal,
        payout: order.billDetails.deliveryFee || 40,
        timeTakenMinutes: timeTaken,
        date: order.deliveredAt || order.updatedAt
      };
    });

    res.status(200).json({
      totalDeliveries,
      totalRevenue,
      totalPayout,
      deliveryDetails
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

// @desc    Get my earnings (Delivery Partner)
// @route   GET /api/withdrawals/my-earnings
// @access  Private (Delivery)
export const getMyEarnings = async (req, res) => {
  try {
    const partnerId = req.user._id;

    const orders = await Order.find({ deliveryPartner: partnerId, status: 'delivered' })
      .populate('store', 'name');
      
    let totalEarnings = 0;
    const orderTransactions = orders.map(order => {
      const payout = order.billDetails?.deliveryFee || 40;
      totalEarnings += payout;
      return {
        id: order._id.toString(),
        type: 'Delivery Earnings',
        res: order.store?.name || 'Unknown',
        amt: payout,
        date: order.deliveredAt || order.updatedAt,
        isCredit: true
      };
    });

    const withdrawals = await Withdrawal.find({ deliveryPartner: partnerId, status: { $ne: 'rejected' } });
    
    let totalWithdrawn = 0;
    const withdrawalTransactions = withdrawals.map(w => {
      totalWithdrawn += w.amount;
      return {
        id: w._id.toString(),
        type: 'Bank Withdrawal',
        res: `Status: ${w.status}`,
        amt: -w.amount,
        date: w.createdAt,
        isCredit: false
      };
    });

    const availableBalance = totalEarnings - totalWithdrawn;
    
    // Combine and sort by date descending
    const transactions = [...orderTransactions, ...withdrawalTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      totalEarnings,
      totalWithdrawn,
      availableBalance,
      totalDeliveries: orders.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch earnings', error: error.message });
  }
};

