import Product from '../models/Product.js';
import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  const { name, icon } = req.body;
  try {
    const category = await Category.create({ name, icon });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get menu for a store grouped by categories
// @route   GET /api/stores/:storeId/menu
// @access  Public
export const getStoreMenu = async (req, res) => {
  const { storeId } = req.params;

  try {
    // Fetch all products in stock for this store
    const products = await Product.find({ store: storeId, inStock: true })
      .populate('category', 'name icon');

    // Group items by category name
    const menuMap = {};
    products.forEach(item => {
      const catName = item.category ? item.category.name : 'Uncategorized';
      if (!menuMap[catName]) {
        menuMap[catName] = [];
      }
      menuMap[catName].push({
        id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        isVeg: item.isVeg,
        rating: item.rating,
        inStock: item.inStock
      });
    });

    // Format structure
    const formattedMenu = Object.keys(menuMap).map(categoryName => ({
      category: categoryName,
      items: menuMap[categoryName]
    }));

    res.json(formattedMenu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products list
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.all !== 'true') {
      filter.inStock = true;
    }
    const products = await Product.find(filter).populate('store', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new Product dish
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const { name, description, price, isVeg, category, store } = req.body;

  try {
    const image = req.fileUrl || '/assets/dish_default.jpg';

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      image,
      isVeg: isVeg === 'true' || isVeg === true,
      category,
      store
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update Product dish
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product item not found' });
    }

    const updates = { ...req.body };
    if (req.fileUrl) {
      updates.image = req.fileUrl;
    }
    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.isVeg) updates.isVeg = updates.isVeg === 'true' || updates.isVeg === true;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete Product dish
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product item not found' });
    }

    product.inStock = false;
    await product.save();

    res.json({ message: 'Product item marked out of stock' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
