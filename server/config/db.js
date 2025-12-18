const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb+srv://marketPlace:test1@cluster0.ybw5lfe.mongodb.net/marketplaceDB?retryWrites=true&w=majority';
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true ,
      tls: true,
      tlsAllowInvalidCertificates: false,
     serverSelectionTimeoutMS: 15000,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err);
    throw err;
  }
};

module.exports = connectDB;
