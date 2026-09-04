const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

const connectDB = require('./config/db');
const Product = require('./models/Product');
const SelectedPlan = require('./models/SelectedPlan');
const seedProducts = require('./data/products');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function serializeProduct(product) {
  const data = product.toObject();

  return {
    id: data._id.toString(),
    slug: data.slug,
    name: data.name,
    brand: data.brand,
    tag: data.tag,
    description: data.description,
    variants: data.variants.map((variant) => ({
      id: variant._id.toString(),
      name: variant.name,
      storage: variant.storage,
      colorName: variant.colorName,
      colorHex: variant.colorHex,
      price: variant.price,
      mrp: variant.mrp,
      imageUrl: variant.imageUrl,
      inStock: variant.inStock,
    })),
    emiPlans: data.emiPlans
      .map((plan) => ({
        id: plan._id.toString(),
        tenureMonths: plan.tenureMonths,
        interestRate: plan.interestRate,
        cashbackAmount: plan.cashbackAmount,
        isZeroInterest: plan.isZeroInterest,
      }))
      .sort((a, b) => a.tenureMonths - b.tenureMonths),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}


function calculateMonthlyEmi(sellingPrice, annualInterestRate, tenureMonths) {
  if (tenureMonths <= 0) return sellingPrice;

  if (annualInterestRate === 0) {
    return Math.round(sellingPrice / tenureMonths);
  }

  const monthlyRate = annualInterestRate / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  return Math.round((sellingPrice * monthlyRate * factor) / (factor - 1));
}

async function seedIfEmpty() {
  const count = await Product.countDocuments();

  if (count === 0) {
    await Product.insertMany(seedProducts);
    console.log('Database was empty, so default product data was seeded automatically.');
  }
}

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      data: products.map(serializeProduct),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.get('/api/products/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let product = await Product.findOne({ slug: idOrSlug.toLowerCase() });

    if (!product && mongoose.isValidObjectId(idOrSlug)) {
      product = await Product.findById(idOrSlug);
    }

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    return res.json({
      success: true,
      data: serializeProduct(product),
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.post('/api/proceed', async (req, res) => {
  try {
    const {
      productId,
      variantId,
      tenureMonths,
    } = req.body;

    if (!productId || !variantId || !tenureMonths) {
      return res.status(400).json({
        success: false,
        error: 'Missing required plan details (productId, variantId, tenureMonths)',
      });
    }

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ success: false, error: 'Invalid productId' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const selectedVariant = product.variants.find(
      (variant) => variant._id.toString() === String(variantId)
    );
    const selectedEmiPlan = product.emiPlans.find(
      (plan) => plan.tenureMonths === Number(tenureMonths)
    );

    if (!selectedVariant || !selectedEmiPlan) {
      return res.status(400).json({ success: false, error: 'Invalid variant or EMI plan' });
    }

    const verifiedMonthlyEmi = calculateMonthlyEmi(
      selectedVariant.price,
      selectedEmiPlan.interestRate,
      selectedEmiPlan.tenureMonths
    );

    const savedPlan = await SelectedPlan.create({
      productId,
      variantId: String(variantId),
      tenureMonths: selectedEmiPlan.tenureMonths,
      monthlyEmi: verifiedMonthlyEmi,
      interestRate: selectedEmiPlan.interestRate,
      cashbackAmount: selectedEmiPlan.cashbackAmount,
    });

    return res.status(201).json({
      success: true,
      message: 'Plan selected successfully! Your request has been recorded.',
      data: {
        id: savedPlan._id.toString(),
        productId: savedPlan.productId.toString(),
        variantId: savedPlan.variantId,
        tenureMonths: savedPlan.tenureMonths,
        monthlyEmi: savedPlan.monthlyEmi,
        interestRate: savedPlan.interestRate,
        cashbackAmount: savedPlan.cashbackAmount,
        createdAt: savedPlan.createdAt,
      },
    });
  } catch (error) {
    console.error('Error recording plan selection:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../../frontend/dist');

  app.use(express.static(frontendDist));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    return res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

async function startServer() {
  try {
    await connectDB();
    await seedIfEmpty();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
