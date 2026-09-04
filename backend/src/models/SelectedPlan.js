const mongoose = require('mongoose');

const selectedPlanSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: { type: String, required: true },
    tenureMonths: { type: Number, required: true, min: 1 },
    monthlyEmi: { type: Number, required: true, min: 0 },
    interestRate: { type: Number, required: true, min: 0 },
    cashbackAmount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SelectedPlan', selectedPlanSchema);
