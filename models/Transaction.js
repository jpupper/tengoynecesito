const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'TYN_Product', required: true },
  productTitle: { type: String, required: true },
  productType: { type: String, enum: ['tengo', 'necesito'], required: true },
  applicantId: { type: String, required: true, index: true },
  applicantName: { type: String, required: true },
  offeredItems: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'TYN_Product' },
    title: { type: String },
    description: { type: String }
  }],
  ownerId: { type: String, required: true, index: true },
  ownerName: { type: String, required: true },
  message: { type: String, default: '', maxlength: 1000 },
  status: { type: String, enum: ['pending', 'accepted', 'completed', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

transactionSchema.index({ applicantId: 1, status: 1 });
transactionSchema.index({ ownerId: 1, status: 1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('TYN_Transaction', transactionSchema);
