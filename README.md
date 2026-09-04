# 1Fi SDE1 Assignment — Product EMI Page

A full-stack product EMI application built with **JavaScript**, **React + Vite + Tailwind CSS**, **Node.js + Express**, and **MongoDB + Mongoose**.

The frontend loads all product, variant, and EMI-plan data dynamically from the backend API. Product detail pages use unique URLs such as `/products/iphone-17-pro`.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + JavaScript |
| Styling | Tailwind CSS |
| Routing | React Router DOM |
| Backend | Node.js + Express |
| Database | MongoDB |
| ODM | Mongoose |
| Deployment | Render Web Service + MongoDB Atlas |

> TypeScript, Prisma, and SQLite have been removed from this version.

## Main Features

- 3 products
- 3 variants per product
- 7 EMI plans per product
- Dynamic API data — no product data hardcoded in React components
- Unique product routes: `/products/:slug`
- Product variant/color/storage selection
- Dynamic EMI calculation
- Selected EMI requests stored in MongoDB
- Responsive Tailwind UI
- Production server serves the React build and Express API from one Render Web Service
- Automatic default product seeding when the MongoDB `products` collection is empty

## Folder Structure

```text
1fi_assigment-main/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── data/
│   │   │   └── products.js
│   │   ├── models/
│   │   │   ├── Product.js
│   │   │   └── SelectedPlan.js
│   │   ├── scripts/
│   │   │   └── seed.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/images/
│   ├── src/
│   │   ├── components/Navbar.jsx
│   │   ├── pages/HomePage.jsx
│   │   ├── pages/ProductPage.jsx
│   │   ├── utils/format.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── render.yaml
├── package.json
└── README.md
```

## MongoDB Data Model

### Product

Each product document contains embedded `variants` and `emiPlans` arrays.

```js
{
  slug: 'iphone-17-pro',
  name: 'iPhone 17 Pro',
  brand: 'Apple',
  tag: 'NEW',
  description: '...',
  variants: [
    {
      storage: '256GB',
      colorName: 'Desert Titanium',
      colorHex: '#E39C6B',
      price: 127400,
      mrp: 134900,
      imageUrl: '/images/iphone-desert.png',
      inStock: true
    }
  ],
  emiPlans: [
    {
      tenureMonths: 3,
      interestRate: 0,
      cashbackAmount: 7500,
      isZeroInterest: true
    }
  ]
}
```

### SelectedPlan

When the user clicks **Proceed with selected plan**, the backend stores the selection in MongoDB.

```js
{
  productId,
  variantId,
  tenureMonths,
  monthlyEmi,
  interestRate,
  cashbackAmount
}
```

## API Endpoints

### `GET /api/health`
Checks the server and MongoDB connection.

### `GET /api/products`
Returns all products with their variants and EMI plans.

### `GET /api/products/:idOrSlug`
Returns one product by MongoDB ID or slug.

Example:

```text
/api/products/iphone-17-pro
```

### `POST /api/proceed`
Stores the selected product variant and EMI plan in MongoDB.

Example request body:

```json
{
  "productId": "<mongodb-product-id>",
  "variantId": "<mongodb-variant-id>",
  "tenureMonths": 6,
  "monthlyEmi": 21233,
  "interestRate": 0,
  "cashbackAmount": 7500
}
```

# Local Setup

## 1. Install dependencies

From the project root:

```bash
npm run install:all
```

## 2. Create a MongoDB database

Create a MongoDB Atlas cluster or use a local MongoDB server.

For Atlas, copy your connection string. It looks similar to:

```text
mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/1fi_assignment?retryWrites=true&w=majority
```

## 3. Create `backend/.env`

Copy `backend/.env.example` to `backend/.env` and set:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/1fi_assignment?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

Never commit your real `.env` file.

## 4. Seed MongoDB manually (optional)

The server automatically inserts the default products when the `products` collection is empty. To reset and reseed manually:

```bash
npm run seed
```

This inserts:

- Apple iPhone 17 Pro — 3 variants, 7 EMI plans
- Samsung Galaxy S24 Ultra — 3 variants, 7 EMI plans
- Google Pixel 9 Pro — 3 variants, 7 EMI plans

## 5. Run frontend + backend

```bash
npm run dev
```

Local URLs:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:5000
Health:   http://localhost:5000/api/health
```

Vite proxies local `/api` requests to port `5000`.

# Deploy on Render

This project is prepared to deploy the **frontend and backend together as one Render Web Service**. Express serves `frontend/dist` in production, so the deployed React app and API use the same domain.

## Step 1 — Push the project to GitHub

```bash
git add .
git commit -m "Convert project to JavaScript and MongoDB"
git push origin main
```

## Step 2 — Prepare MongoDB Atlas

1. Create your MongoDB Atlas cluster.
2. Create a database user.
3. In **Network Access**, allow the connection required for your Render service. For a simple assignment deployment, many developers temporarily use `0.0.0.0/0`; use stricter network rules for production systems.
4. Copy the Atlas connection string.
5. Use a database name such as `1fi_assignment` in the URI.

## Step 3 — Create a Render Web Service

You can use the included `render.yaml` Blueprint or configure the service manually.

### Manual Render settings

| Setting | Value |
|---|---|
| Service Type | Web Service |
| Runtime | Node |
| Root Directory | leave blank / repository root |
| Build Command | `npm install --include=dev && npm run render-build` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

The server listens on Render's `PORT` environment variable and binds to `0.0.0.0`.

## Step 4 — Add Render environment variables

In **Render → Service → Environment**, add:

```env
NODE_ENV=production
MONGO_URI=your_mongodb_atlas_connection_string
```

Do not manually set `PORT`; Render supplies it.

## Step 5 — Deploy

Click **Create Web Service** / **Deploy latest commit**.

During the build Render will:

1. Install root dependencies.
2. Install backend dependencies.
3. Install frontend dependencies, including Vite/Tailwind build dependencies.
4. Run `vite build`.
5. Start Express with `npm start`.
6. Connect to MongoDB.
7. Seed the three default products only if the products collection is empty.
8. Serve both the React app and `/api/*` endpoints from the same Render URL.

After deployment, test:

```text
https://YOUR-SERVICE.onrender.com/
https://YOUR-SERVICE.onrender.com/api/health
https://YOUR-SERVICE.onrender.com/products/iphone-17-pro
```

## Render Blueprint

The included `render.yaml` contains:

```yaml
services:
  - type: web
    name: 1fi-product-emi
    runtime: node
    plan: free
    buildCommand: npm install --include=dev && npm run render-build
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        sync: false
```

When deploying from the Blueprint, Render will ask you for the secret `MONGO_URI` value.

## Useful Commands

```bash
npm run install:all   # install all dependencies
npm run dev           # backend + frontend development servers
npm run seed          # reset and seed MongoDB
npm run build         # build React frontend
npm start             # start Express production server
```
