const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const UserProfile = require('../models/UserProfile');
const auth = require('../middleware/auth');

// POST /api/transactions - Apply to a product
router.post('/', auth, async (req, res) => {
  try {
    const { productId, offeredItems, message } = req.body;
    const applicantId = req.user.userId || req.user.id || req.user._id;
    const applicantName = req.user.username || req.user.name || 'Usuario';

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Producto requerido' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    if (product.userId === applicantId) {
      return res.status(400).json({ success: false, message: 'No podes aplicar a tu propio producto' });
    }

    // Check existing pending application
    const existing = await Transaction.findOne({
      productId,
      applicantId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Ya aplicaste a este producto' });
    }

    const transaction = new Transaction({
      productId: product._id,
      productTitle: product.title,
      productType: product.type,
      applicantId,
      applicantName,
      offeredItems: offeredItems || [],
      ownerId: product.userId,
      ownerName: product.username,
      message: message || '',
      status: 'pending'
    });

    await transaction.save();
    res.status(201).json({ success: true, transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/transactions/mine - My transactions (as applicant or owner)
router.get('/mine', auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    
    const asApplicant = await Transaction.find({ applicantId: userId })
      .sort({ createdAt: -1 });
    
    const asOwner = await Transaction.find({ ownerId: userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, asApplicant, asOwner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/transactions/:id/status - Update transaction status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const userId = req.user.userId || req.user.id || req.user._id;

    if (!['accepted', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Estado invalido' });
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaccion no encontrada' });
    }

    // Only the product owner can accept/reject
    if ((status === 'accepted' || status === 'rejected') && transaction.ownerId !== userId) {
      return res.status(403).json({ success: false, message: 'Solo el dueno del producto puede decidir' });
    }

    // Only the applicant can mark completed
    if (status === 'completed' && transaction.applicantId !== userId) {
      return res.status(403).json({ success: false, message: 'Solo quien aplico puede marcar como completado' });
    }

    transaction.status = status;
    if (status === 'completed') {
      transaction.completedAt = new Date();

      // Increment completed transactions count for both users
      await UserProfile.findOneAndUpdate(
        { userId: transaction.applicantId },
        { $inc: { completedTransactions: 1 } }
      );
      await UserProfile.findOneAndUpdate(
        { userId: transaction.ownerId },
        { $inc: { completedTransactions: 1 } }
      );

      // Mark product as completed
      await Product.findByIdAndUpdate(transaction.productId, { status: 'completed' });
    }

    await transaction.save();
    res.json({ success: true, transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/transactions/count - Get completed transaction count for a user
router.get('/count', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId requerido' });

    const count = await Transaction.countDocuments({
      $or: [{ applicantId: userId }, { ownerId: userId }],
      status: 'completed'
    });

    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
