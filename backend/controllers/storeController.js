import Store from '../models/Store.js';

// @desc    Get all stores with search, category, and sort filters
// @route   GET /api/stores
// @access  Public
export const getStores = async (req, res) => {
  const { search, cuisine, rating, vegOnly, sort } = req.query;
  let queryObject = { isActive: true };

  // 1. Cuisine Category Filter
  if (cuisine && cuisine !== 'all') {
    queryObject.cuisineTypes = { $in: [new RegExp(cuisine, 'i')] };
  }

  // 2. Search Query (matches store names or cuisines)
  if (search) {
    queryObject.$or = [
      { name: { $regex: search, $options: 'i' } },
      { cuisineTypes: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // 3. Minimum Rating Filter
  if (rating) {
    queryObject.rating = { $gte: parseFloat(rating) };
  }

  try {
    let query = Store.find(queryObject);

    // 4. Sorting logic
    if (sort === 'rating') {
      query = query.sort({ rating: -1 });
    } else if (sort === 'time') {
      query = query.sort({ deliveryTime: 1 });
    } else if (sort === 'cost-low') {
      query = query.sort({ costForTwo: 1 });
    } else if (sort === 'cost-high') {
      query = query.sort({ costForTwo: -1 });
    } else {
      query = query.sort({ createdAt: -1 }); // Default recent
    }

    const stores = await query;
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single store by ID
// @route   GET /api/stores/:id
// @access  Public
export const getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new store profile
// @route   POST /api/admin/stores
// @access  Private/Admin
export const createStore = async (req, res) => {
  const { name, description, cuisineTypes, deliveryTime, distance, costForTwo, featured } = req.body;

  try {
    const bannerImage = req.fileUrl || '/assets/res_default.jpg'; // use uploaded url or default

    const store = await Store.create({
      name,
      description,
      bannerImage,
      cuisineTypes: typeof cuisineTypes === 'string' ? cuisineTypes.split(',') : cuisineTypes,
      deliveryTime: parseInt(deliveryTime),
      distance: parseFloat(distance),
      costForTwo: parseInt(costForTwo),
      featured: featured === 'true' || featured === true
    });

    res.status(201).json(store);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update store profile
// @route   PUT /api/admin/stores/:id
// @access  Private/Admin
export const updateStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Merge updates
    const updates = { ...req.body };
    if (req.fileUrl) {
      updates.bannerImage = req.fileUrl;
    }
    if (updates.cuisineTypes && typeof updates.cuisineTypes === 'string') {
      updates.cuisineTypes = updates.cuisineTypes.split(',');
    }

    const updatedStore = await Store.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(updatedStore);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete store
// @route   DELETE /api/admin/stores/:id
// @access  Private/Admin
export const deleteStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Soft delete or hard delete? Let's disable it (soft-delete)
    store.isActive = false;
    await store.save();

    res.json({ message: 'Store deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
