import Banner from '../models/Banner.js';

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch banners', error: error.message });
  }
};

// @desc    Get active banners
// @route   GET /api/banners/active
// @access  Public
export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch active banners', error: error.message });
  }
};

// @desc    Create a banner
// @route   POST /api/banners
// @access  Private/Admin
export const createBanner = async (req, res) => {
  try {
    const { title, subtitle, imageUrl, linkUrl, position, category, isActive, order } = req.body;
    
    // Enforce limits if trying to create an active banner
    if (isActive) {
      const activeCount = await Banner.countDocuments({ category: category || 'home', isActive: true });
      if ((category === 'offer' || category === 'about') && activeCount >= 1) {
        return res.status(400).json({ message: `Only 1 active banner is allowed for ${category} page. Please deactivate the existing one first.` });
      }
      if ((!category || category === 'home') && activeCount >= 3) {
        return res.status(400).json({ message: 'Only 3 active banners are allowed for home page. Please deactivate an existing one first.' });
      }
    }

    const banner = new Banner({ title, subtitle, imageUrl, linkUrl, position, category, isActive, order });
    const createdBanner = await banner.save();
    res.status(201).json(createdBanner);
    if (global.io) {
      global.io.emit('contentUpdated', { type: 'banner', action: 'create' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to create banner', error: error.message });
  }
};

// @desc    Update a banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
export const updateBanner = async (req, res) => {
  try {
    const { title, subtitle, imageUrl, linkUrl, position, category, isActive, order } = req.body;
    const banner = await Banner.findById(req.params.id);

    if (banner) {
      const targetCategory = category || banner.category;
      
      // Enforce limits if trying to activate
      if (isActive && (!banner.isActive || targetCategory !== banner.category)) {
        const activeCount = await Banner.countDocuments({ 
          category: targetCategory, 
          isActive: true, 
          _id: { $ne: banner._id } 
        });
        
        if ((targetCategory === 'offer' || targetCategory === 'about') && activeCount >= 1) {
          return res.status(400).json({ message: `Only 1 active banner is allowed for ${targetCategory} page. Please deactivate the existing one first.` });
        }
        if (targetCategory === 'home' && activeCount >= 3) {
          return res.status(400).json({ message: 'Only 3 active banners are allowed for home page. Please deactivate an existing one first.' });
        }
      }

      banner.title = title || banner.title;
      banner.subtitle = subtitle !== undefined ? subtitle : banner.subtitle;
      banner.imageUrl = imageUrl || banner.imageUrl;
      banner.linkUrl = linkUrl !== undefined ? linkUrl : banner.linkUrl;
      banner.position = position || banner.position;
      banner.category = category || banner.category;
      banner.isActive = isActive !== undefined ? isActive : banner.isActive;
      banner.order = order !== undefined ? order : banner.order;

      const updatedBanner = await banner.save();
      res.json(updatedBanner);
      if (global.io) {
        global.io.emit('contentUpdated', { type: 'banner', action: 'update', id: updatedBanner._id });
      }
    } else {
      res.status(404).json({ message: 'Banner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update banner', error: error.message });
  }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (banner) {
      await banner.deleteOne();
      res.json({ message: 'Banner removed' });
      if (global.io) {
        global.io.emit('contentUpdated', { type: 'banner', action: 'delete', id: req.params.id });
      }
    } else {
      res.status(404).json({ message: 'Banner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete banner', error: error.message });
  }
};
