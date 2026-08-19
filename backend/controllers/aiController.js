import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';

// AI Product Recommendations
export const getAIRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user search history and wishlist to tailor recommendations
    const user = await User.findById(userId).populate('wishlist');
    const searchTerms = user?.searchHistory || [];
    const wishlistIds = user?.wishlist?.map(item => item._id) || [];

    // 2. Based on previous orders
    const prevOrders = await Order.find({ user: userId, status: 'delivered' })
      .populate('items.product')
      .limit(5);

    let favoriteCategories = [];
    prevOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.product && item.product.category) {
          favoriteCategories.push(item.product.category.toString());
        }
      });
    });

    // Unique categories
    favoriteCategories = [...new Set(favoriteCategories)];

    // Fetch products matching these categories
    let basedOnOrders = [];
    if (favoriteCategories.length > 0) {
      basedOnOrders = await Product.find({
        category: { $in: favoriteCategories },
        inStock: true
      }).limit(5);
    } else {
      // Fallback to top-rated
      basedOnOrders = await Product.find({ rating: { $gte: 4 }, inStock: true }).limit(5);
    }

    // 3. Recommended for you (Wishlist + matches search terms)
    let recommendedForYou = [];
    if (searchTerms.length > 0) {
      // Search matching product names/description
      const regexQueries = searchTerms.map(term => new RegExp(term, 'i'));
      recommendedForYou = await Product.find({
        $or: [
          { name: { $in: regexQueries } },
          { description: { $in: regexQueries } }
        ],
        inStock: true
      }).limit(5);
    }

    // Combine with wishlist items or high-rated if empty
    if (recommendedForYou.length < 3) {
      const extra = await Product.find({
        _id: { $nin: recommendedForYou.map(f => f._id) },
        rating: { $gte: 4 },
        inStock: true
      }).limit(5 - recommendedForYou.length);
      recommendedForYou = [...recommendedForYou, ...extra];
    }

    // 4. You may like this (Popular items excluding what they already ordered)
    const youMayLike = await Product.find({
      rating: { $gte: 4.5 },
      inStock: true
    }).limit(5);

    res.status(200).json({
      success: true,
      basedOnOrders,
      recommendedForYou,
      youMayLike
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mood and Meal Planner filters
export const getFilteredProducts = async (req, res) => {
  try {
    const { mood, dietGoal } = req.query;
    let filter = { inStock: true };

    if (mood) {
      filter.mood = { $in: [mood] };
    }
    if (dietGoal) {
      filter.dietGoal = { $in: [dietGoal] };
    }

    const products = await Product.find(filter).populate('store').populate('category');
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// "I Can't Decide" - Surprise Product Recommender
export const getSurpriseProduct = async (req, res) => {
  try {
    const count = await Product.countDocuments({ inStock: true });
    if (count === 0) {
      return res.status(404).json({ success: false, message: 'No product items found' });
    }
    const randomIndex = Math.floor(Math.random() * count);
    const randomProduct = await Product.findOne({ inStock: true })
      .skip(randomIndex)
      .populate('store')
      .populate('category');

    res.status(200).json({ success: true, data: randomProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// AI Chatbot Assistant handler
export const handleChatBot = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;
    const cleanMsg = message.toLowerCase();

    // 0. Check ADD TO CART / ORDER intent
    if (cleanMsg.startsWith('add ') || cleanMsg.startsWith('order ') || cleanMsg.includes('to cart')) {
      let searchItem = cleanMsg.replace(/add /g, '').replace(/order /g, '').replace(/to cart/g, '').replace(/please/g, '').trim();
      
      if (searchItem) {
        // Find best matching product
        const regex = new RegExp(searchItem, 'i');
        const productItem = await Product.findOne({ 
          $or: [{ name: regex }, { description: regex }],
          inStock: true 
        }).populate('store');

        if (productItem) {
          return res.status(200).json({
            reply: `I found **${productItem.name}** for ₹${productItem.price}. I've added it to your cart! 🛒`,
            action: 'ADD_TO_CART',
            payload: {
              id: productItem._id,
              name: productItem.name,
              price: productItem.price,
              image: productItem.image,
              isVeg: productItem.isVeg,
              resId: productItem.store?._id || 'res-gourmet-burger',
              resName: productItem.store?.name || 'RoseDash kitchen'
            }
          });
        } else {
          return res.status(200).json({
            reply: `I couldn't find an exact match for "${searchItem}" in our current menu. Try searching for a specific dish like "Truffle Burger" or "Margherita Pizza".`
          });
        }
      }
    }

    // 1. Check order query
    if (cleanMsg.includes('order') || cleanMsg.includes('status') || cleanMsg.includes('track') || cleanMsg.includes('where')) {
      const latestOrder = await Order.findOne({ user: userId })
        .sort({ createdAt: -1 })
        .populate('store');

      if (!latestOrder) {
        return res.status(200).json({
          reply: "You haven't placed any orders yet. Would you like me to recommend some delicious options to get started?"
        });
      }

      return res.status(200).json({
        reply: `Your latest order from **${latestOrder.store.name}** is currently **${latestOrder.status.toUpperCase()}**.\n- Total bill: ₹${latestOrder.billDetails.grandTotal}\n- Order placed: ${new Date(latestOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\nLet me know if you want to track it on the map!`
      });
    }

    // 2. Check coupon query
    if (cleanMsg.includes('coupon') || cleanMsg.includes('code') || cleanMsg.includes('discount') || cleanMsg.includes('offer')) {
      const coupons = await Coupon.find({ isActive: true }).limit(3);
      if (coupons.length === 0) {
        return res.status(200).json({
          reply: "We don't have any active discount coupons right now. However, you can spin the Spin & Win wheel in your Rewards Dashboard to win exciting rewards!"
        });
      }

      let couponList = coupons.map(c => `- **${c.code}**: Get ${c.discountPercent}% off on orders above ₹${c.minOrderValue || 0}`).join('\n');
      return res.status(200).json({
        reply: `Here are some active discount coupons you can apply at checkout:\n\n${couponList}`
      });
    }

    // 3. Check product recommendation
    if (cleanMsg.includes('recommend') || cleanMsg.includes('suggest') || cleanMsg.includes('eat') || cleanMsg.includes('product') || cleanMsg.includes('hungry')) {
      const bestProducts = await Product.find({ rating: { $gte: 4.5 }, inStock: true }).limit(3);
      let productList = bestProducts.map(f => `- **${f.name}** (₹${f.price})`).join('\n');
      return res.status(200).json({
        reply: `Sure, here are some of our top-rated recommendations:\n\n${productList}\n\nYou can also check the Product Mood Selector or Smart Meal Planner on our Homepage for curated results!`
      });
    }

    // 4. Default fallback friendly AI Persona
    res.status(200).json({
      reply: "Hi! I am **BiteBot**, your RoseDash AI Assistant. 🍔\n\nI can help you with:\n- Checking your **Order Status** (type 'where is my order')\n- Recommending **popular dishes** (type 'suggest some product')\n- Finding active **coupon codes** (type 'any discounts available')\n\nHow can I assist you today?"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
