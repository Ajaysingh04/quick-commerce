import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Store from '../models/Store.js';

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const filter = {};
    if (req.query.all !== 'true') {
      filter.isActive = true;
    }
    const categories = await Category.find(filter);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  const { name, icon, image } = req.body;
  try {
    const finalImage = req.fileUrl || image || '';
    const category = await Category.create({ name, icon, image: finalImage });
    res.status(201).json(category);
    if (global.io) global.io.emit('contentUpdated', { type: 'category' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};

// @desc    Create multiple categories in bulk
// @route   POST /api/products/categories/bulk
// @access  Private/Admin
export const bulkCreateCategories = async (req, res) => {
  try {
    const { categories } = req.body;
    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({ message: 'Please provide an array of categories' });
    }
    
    const existingCats = await Category.find({});
    const newCategoriesToInsert = [];
    
    for (const cat of categories) {
      // Check if same name and image exists
      const isDuplicate = existingCats.some(
        ex => ex.name?.toLowerCase() === cat.name?.toLowerCase() && ex.image === cat.image
      );
      if (!isDuplicate) {
        newCategoriesToInsert.push(cat);
        existingCats.push(cat); // Prevent duplicates within the file itself
      }
    }
    
    let inserted = [];
    if (newCategoriesToInsert.length > 0) {
      inserted = await Category.insertMany(newCategoriesToInsert);
      if (global.io) global.io.emit('contentUpdated', { type: 'category' });
    }
    
    res.status(201).json({ 
      message: `${inserted.length} added, ${categories.length - inserted.length} skipped.`, 
      inserted,
      skippedCount: categories.length - inserted.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to bulk insert categories', error: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.fileUrl) {
      updates.image = req.fileUrl;
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
    if (global.io) global.io.emit('contentUpdated', { type: 'category' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
    if (global.io) global.io.emit('contentUpdated', { type: 'category' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    // Add category filter for faster queries
    if (req.query.category) {
      filter.category = req.query.category;
    }

    let query = Product.find(filter)
      .populate('store', 'name')
      .populate('category', 'name');

    // Add limit support
    if (req.query.limit) {
      query = query.limit(parseInt(req.query.limit));
    }

    const products = await query;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new Product dish
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const { name, description, price, isVeg, category, store, isPopular } = req.body;

  try {
    const image = req.fileUrl || '/assets/dish_default.jpg';

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      image,
      isVeg: isVeg === 'true' || isVeg === true,
      category,
      store,
      isPopular: isPopular === 'true' || isPopular === true
    });

    res.status(201).json(product);
    if (global.io) {
      global.io.emit('contentUpdated', { type: 'product', action: 'create' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create multiple products in bulk
// @route   POST /api/products/bulk
// @access  Private/Admin
export const bulkCreateProducts = async (req, res) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ message: 'Please provide an array of products' });
    }
    
    // We need all categories mapped by name for easy lookup
    const existingCats = await Category.find({});
    const catMap = {};
    existingCats.forEach(c => {
      catMap[c.name.toLowerCase().trim()] = c._id;
    });

    // We need all stores mapped by name for easy lookup
    const existingStores = await Store.find({});
    const storeMap = {};
    
    // Ensure at least one store exists for bulk fallback
    if (existingStores.length === 0) {
      const defaultStore = await Store.create({ 
        name: 'Main Store', 
        bannerImage: '/assets/store_default.jpg',
        deliveryTime: 30,
        isActive: true
      });
      existingStores.push(defaultStore);
    }
    
    existingStores.forEach(s => {
      storeMap[s.name.toLowerCase().trim()] = s._id;
    });
    
    // Map existing products to prevent duplicates (by name)
    const existingProds = await Product.find({});
    const prodSet = new Set(existingProds.map(p => p.name.toLowerCase().trim()));

    const newProductsToInsert = [];
    
    for (const item of products) {
      const prodName = item.name ? item.name.toLowerCase().trim() : '';
      if (!prodName || prodSet.has(prodName)) continue; // Skip duplicates or empty
      
      let catId = item.category;
      
      if (typeof catId === 'string' && catMap[catId.toLowerCase().trim()]) {
        catId = catMap[catId.toLowerCase().trim()];
      } else if (catId && !String(catId).match(/^[0-9a-fA-F]{24}$/)) {
        // Create category if it doesn't exist
        const newCat = await Category.create({ name: catId, isActive: true });
        catMap[catId.toLowerCase().trim()] = newCat._id;
        catId = newCat._id;
      }

      let storeId = item.store;
      if (typeof storeId === 'string' && storeMap[storeId.toLowerCase().trim()]) {
        storeId = storeMap[storeId.toLowerCase().trim()];
      } else if (storeId && !String(storeId).match(/^[0-9a-fA-F]{24}$/)) {
        // Find first existing store as fallback if store doesn't exist to prevent arbitrary creation
        storeId = existingStores[0]?._id || existingProds[0]?.store;
      }
      
      newProductsToInsert.push({
        name: item.name,
        description: item.description || '',
        price: parseFloat(item.price) || 0,
        originalPrice: item.originalPrice ? parseFloat(item.originalPrice) : undefined,
        weight: item.weight || '1 pc',
        sku: item.sku || `SKU-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        image: item.image || '/assets/dish_default.jpg',
        isVeg: String(item.isVeg).toLowerCase() === 'true' || item.isVeg === true,
        category: catId,
        store: storeId || existingProds[0]?.store || existingStores[0]?._id,
        inStock: item.inStock !== undefined ? (String(item.inStock).toLowerCase() === 'true' || item.inStock === true) : true,
        isPopular: String(item.isPopular).toLowerCase() === 'true' || item.isPopular === true
      });
      prodSet.add(prodName); 
    }
    
    let inserted = [];
    if (newProductsToInsert.length > 0) {
      inserted = await Product.insertMany(newProductsToInsert);
      if (global.io) global.io.emit('contentUpdated', { type: 'product' });
    }
    
    res.status(201).json({ 
      message: `${inserted.length} added, ${products.length - inserted.length} skipped.`, 
      inserted,
      skippedCount: products.length - inserted.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to bulk insert products', error: error.message });
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
    if (updates.isVeg !== undefined) updates.isVeg = updates.isVeg === 'true' || updates.isVeg === true;
    if (updates.isPopular !== undefined) updates.isPopular = updates.isPopular === 'true' || updates.isPopular === true;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
    if (global.io) {
      global.io.emit('contentUpdated', { type: 'product', action: 'update', id: updatedProduct._id });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete Product dish
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product item not found' });
    }

    res.json({ message: 'Product deleted successfully' });
    if (global.io) {
      global.io.emit('contentUpdated', { type: 'product', action: 'delete', id: req.params.id });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
