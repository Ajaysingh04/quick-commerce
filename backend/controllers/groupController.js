import GroupCart from '../models/GroupCart.js';
import Product from '../models/Product.js';

// Create a new Group Cart session
export const createGroupCart = async (req, res) => {
  try {
    const { storeId } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    if (!storeId) {
      return res.status(400).json({ success: false, message: 'Store ID is required' });
    }

    // Generate unique 6 letter group code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const groupCart = await GroupCart.create({
      store: storeId,
      createdBy: userId,
      code,
      members: [{ user: userId, name: userName }],
      items: [],
      status: 'active'
    });

    res.status(201).json({ success: true, code, data: groupCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Join an existing Group Cart session
export const joinGroupCart = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    const groupCart = await GroupCart.findOne({ code, status: 'active' });
    if (!groupCart) {
      return res.status(404).json({ success: false, message: 'Active Group Cart not found for this code.' });
    }

    // Add user as member if not already added
    const isMember = groupCart.members.some(member => member.user && member.user.toString() === userId.toString());
    if (!isMember) {
      groupCart.members.push({ user: userId, name: userName });
      await groupCart.save();
    }

    res.status(200).json({ success: true, data: groupCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add / Update item in Group Cart
export const addToGroupCart = async (req, res) => {
  try {
    const { code, productId, quantity } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    const groupCart = await GroupCart.findOne({ code, status: 'active' });
    if (!groupCart) {
      return res.status(404).json({ success: false, message: 'Active Group Cart not found.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product item not found.' });
    }

    // Check if item already added by this specific user
    const existingItemIndex = groupCart.items.findIndex(
      item => item.user.toString() === userId.toString() && item.product.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
      if (quantity <= 0) {
        // Remove item if quantity set to 0
        groupCart.items.splice(existingItemIndex, 1);
      } else {
        groupCart.items[existingItemIndex].quantity = quantity;
      }
    } else if (quantity > 0) {
      groupCart.items.push({
        user: userId,
        userName,
        product: productId,
        quantity,
        price: product.price
      });
    }

    await groupCart.save();
    const updatedCart = await GroupCart.findById(groupCart._id)
      .populate('items.product')
      .populate('members.user');

    // Notify all members via Socket.io
    if (global.io) {
      global.io.to(`group_${code}`).emit('groupCartUpdated', updatedCart);
    }

    res.status(200).json({ success: true, data: updatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Split bill details & lock cart
export const splitBill = async (req, res) => {
  try {
    const { code } = req.params;
    const groupCart = await GroupCart.findOne({ code }).populate('items.product');

    if (!groupCart) {
      return res.status(404).json({ success: false, message: 'Group Cart not found.' });
    }

    // Calculate subtotal
    let subtotal = 0;
    const userTotals = {}; // Calculate total price of product added by each user

    groupCart.items.forEach(item => {
      const itemCost = item.price * item.quantity;
      subtotal += itemCost;

      const userKey = item.user.toString();
      if (!userTotals[userKey]) {
        userTotals[userKey] = {
          userId: item.user,
          userName: item.userName,
          itemsCost: 0,
          items: []
        };
      }
      userTotals[userKey].itemsCost += itemCost;
      userTotals[userKey].items.push({
        name: item.product ? item.product.name : 'Product Item',
        quantity: item.quantity,
        price: item.price
      });
    });

    const tax = Math.round(subtotal * 0.05); // 5% GST
    const deliveryFee = 40; // Flat delivery fee
    const grandTotal = subtotal + tax + deliveryFee;

    // Split tax and delivery fee proportionally or equally
    const numMembers = Object.keys(userTotals).length || 1;
    const sharedTaxPerMember = tax / numMembers;
    const sharedDeliveryPerMember = deliveryFee / numMembers;

    const splitBreakdown = [];
    for (const key in userTotals) {
      const uTotal = userTotals[key];
      const memberTotal = uTotal.itemsCost + sharedTaxPerMember + sharedDeliveryPerMember;
      splitBreakdown.push({
        userId: uTotal.userId,
        userName: uTotal.userName,
        itemsCost: Math.round(uTotal.itemsCost),
        taxShare: Math.round(sharedTaxPerMember),
        deliveryShare: Math.round(sharedDeliveryPerMember),
        memberTotal: Math.round(memberTotal),
        items: uTotal.items
      });
    }

    res.status(200).json({
      success: true,
      billDetails: {
        subtotal,
        tax,
        deliveryFee,
        grandTotal
      },
      splitBreakdown,
      status: groupCart.status
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lock Group Cart (stop changes before checkout)
export const lockGroupCart = async (req, res) => {
  try {
    const { code } = req.body;
    const groupCart = await GroupCart.findOne({ code });

    if (!groupCart) {
      return res.status(404).json({ success: false, message: 'Group Cart not found.' });
    }

    groupCart.status = 'locked';
    await groupCart.save();

    if (global.io) {
      global.io.to(`group_${code}`).emit('groupCartLocked', { code });
    }

    res.status(200).json({ success: true, message: 'Group Cart locked successfully', data: groupCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
