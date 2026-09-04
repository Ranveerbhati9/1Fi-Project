const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is missing. Add it to backend/.env or Render environment variables.');
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected sucessfully");
}

module.exports = connectDB;
