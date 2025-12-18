const mongoose = require('mongoose');
require('dotenv').config();

const resetCollections = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/marketplaceDB');
    const db = mongoose.connection.db;
    
    // Drop existing items collection
    try {
      await db.collection('items').drop();
      console.log('Dropped items collection');
    } catch (e) {
      console.log('Items collection does not exist, skipping drop');
    }
    
    // Create new items collection without strict validation
    await db.createCollection('items');
    console.log('Created fresh items collection');
    
    await mongoose.connection.close();
    console.log('Done');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

resetCollections();
