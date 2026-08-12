const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

console.log('[STEP 1] Script started');
console.log('[STEP 2] MONGODB_URI exists:', !!process.env.MONGODB_URI);

dns.setServers(['8.8.8.8', '8.8.4.4']);

const host = 'yez-bee.pnmkrhi.mongodb.net';
console.log('[STEP 3] Resolving DNS for host:', host);

dns.resolve(host, 'TXT', (err, addresses) => {
  if (err) {
    console.error('[DNS ERROR]', err.message);
  } else {
    console.log('[DNS SUCCESS] TXT records:', addresses);
  }

  console.log('[STEP 4] Attempting Mongoose connect (timeout 5s)...');
  const uri = process.env.MONGODB_URI;

  mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  })
  .then(() => {
    console.log('[CONNECT SUCCESS] Connected to MongoDB Atlas!');
    console.log('Database Name:', mongoose.connection.name);
    process.exit(0);
  })
  .catch((connectErr) => {
    console.error('[CONNECT FAILED] Error:', connectErr.message);
    process.exit(1);
  });
});
