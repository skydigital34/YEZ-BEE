import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import mongoose from 'mongoose';

async function testConnection() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/yezbee';
  console.log('Testing connection to MongoDB...');
  console.log('URI:', uri.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://***:***@'));

  try {
    dns_set();
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      dbName: 'yezbee',
    });
    console.log('SUCCESS: Connected to MongoDB successfully!');
    console.log('Database state:', mongoose.connection.readyState);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err: any) {
    console.error('ERROR: Could not connect to MongoDB:', err.message);
    process.exit(1);
  }
}

function dns_set() {
  try {
    const dns = require('dns');
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch (e) {}
}

testConnection();
