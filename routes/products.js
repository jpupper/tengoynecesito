const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// GET /api/products - List products with filters
router.get('/', async (req, res) => {
  try {
    const { type, category, status, search, userId, limit = 20, skip = 0 } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({ success: true, products, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/latest - Latest products for home
router.get('/latest', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const products = await Product.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id - Single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products - Create product
router.post('/', auth, async (req, res) => {
  try {
    const { type, title, description, category, images } = req.body;
    
    if (!type || !title || !description) {
      return res.status(400).json({ success: false, message: 'Faltan campos requeridos (type, title, description)' });
    }

    const product = new Product({
      userId: req.user.userId || req.user.id || req.user._id,
      username: req.user.username || req.user.name || 'anon',
      type,
      title,
      description,
      category: category || 'otro',
      images: images || []
    });

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    
    const userId = req.user.userId || req.user.id || req.user._id;
    if (product.userId !== userId) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    const { title, description, category, images, status } = req.body;
    if (title) product.title = title;
    if (description) product.description = description;
    if (category) product.category = category;
    if (images) product.images = images;
    if (status) product.status = status;

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    
    const userId = req.user.userId || req.user.id || req.user._id;
    if (product.userId !== userId) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
