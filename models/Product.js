const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  username: { type: String, required: true },
  type: { type: String, enum: ['tengo', 'necesito'], required: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 2000 },
  category: { type: String, default: 'otro', index: true },
  images: [{ type: String }],
  status: { type: String, enum: ['active', 'in_transaction', 'completed'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

productSchema.index({ createdAt: -1 });
productSchema.index({ type: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('TYN_Product', productSchema);
