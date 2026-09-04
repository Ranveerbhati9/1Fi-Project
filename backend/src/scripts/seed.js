require('dotenv').config();

const connectDB = require('../config/db');
const Product = require('../models/Product');
const SelectedPlan = require('../models/SelectedPlan');
const products = require('../data/products');

async function seed() {
  try {
    await connectDB();

    await SelectedPlan.deleteMany({});
    await Product.deleteMany({});
    await Product.insertMany(products);

    console.log('Seed complete: 3 products, 9 variants, and 21 EMI plans inserted.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
