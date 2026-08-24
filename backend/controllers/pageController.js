import Page from '../models/Page.js';

// @desc    Get all pages
// @route   GET /api/pages
// @access  Public
export const getPages = async (req, res) => {
  try {
    const pages = await Page.find();
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pages', error: error.message });
  }
};

// @desc    Get page by slug
// @route   GET /api/pages/:slug
// @access  Public
export const getPageBySlug = async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (page) {
      res.json(page);
    } else {
      res.status(404).json({ message: 'Page not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch page', error: error.message });
  }
};

// @desc    Create a page
// @route   POST /api/pages
// @access  Private/Admin
export const createPage = async (req, res) => {
  try {
    const { slug, title, content, isActive } = req.body;
    
    const pageExists = await Page.findOne({ slug });
    if (pageExists) {
      return res.status(400).json({ message: 'Page with this slug already exists' });
    }

    const page = new Page({ slug, title, content, isActive });
    const createdPage = await page.save();
    res.status(201).json(createdPage);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create page', error: error.message });
  }
};

// @desc    Update a page
// @route   PUT /api/pages/:id
// @access  Private/Admin
export const updatePage = async (req, res) => {
  try {
    const { slug, title, content, isActive } = req.body;
    const page = await Page.findById(req.params.id);

    if (page) {
      page.slug = slug || page.slug;
      page.title = title || page.title;
      page.content = content !== undefined ? content : page.content;
      page.isActive = isActive !== undefined ? isActive : page.isActive;

      const updatedPage = await page.save();
      res.json(updatedPage);
    } else {
      res.status(404).json({ message: 'Page not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update page', error: error.message });
  }
};

// @desc    Delete a page
// @route   DELETE /api/pages/:id
// @access  Private/Admin
export const deletePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (page) {
      await page.deleteOne();
      res.json({ message: 'Page removed' });
    } else {
      res.status(404).json({ message: 'Page not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete page', error: error.message });
  }
};
