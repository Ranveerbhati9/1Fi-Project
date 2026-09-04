const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    storage: { type: String, required: true },
    colorName: { type: String, required: true },
    colorHex: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    inStock: { type: Boolean, default: true },
  },
  { _id: true }
);

const emiPlanSchema = new mongoose.Schema(
  {
    tenureMonths: { type: Number, required: true, min: 1 },
    interestRate: { type: Number, required: true, min: 0 },
    cashbackAmount: { type: Number, default: 0, min: 0 },
    isZeroInterest: { type: Boolean, default: false },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    tag: { type: String, default: null },
    description: { type: String, required: true },
    variants: {
      type: [variantSchema],
      validate: [(value) => value.length >= 1, 'At least one variant is required'],
    },
    emiPlans: {
      type: [emiPlanSchema],
      validate: [(value) => value.length >= 1, 'At least one EMI plan is required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
