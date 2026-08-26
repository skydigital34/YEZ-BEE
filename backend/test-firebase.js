const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const projectId = (process.env.FIREBASE_PROJECT_ID || 'yezbee-5944b').replace(/^"|"$/g, '').trim();
let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (clientEmail) {
  clientEmail = clientEmail.trim();
  if (clientEmail.startsWith('"') && clientEmail.endsWith('"')) {
    clientEmail = clientEmail.slice(1, -1);
  }
}

if (privateKey) {
  let cleanKey = privateKey.trim();
  if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) {
    cleanKey = cleanKey.slice(1, -1);
  }
  cleanKey = cleanKey.replace(/\\n/g, '\n');
  privateKey = cleanKey;
}

console.log('--- Firebase Admin Certification Test ---');
console.log('Project ID:', projectId);
console.log('Client Email:', clientEmail);
console.log('Private Key length:', privateKey ? privateKey.length : 0);

if (!privateKey) {
  console.error('ERROR: No private key found in .env');
  process.exit(1);
}

console.log('Private Key starts with:', JSON.stringify(privateKey.slice(0, 40)));
console.log('Private Key ends with:', JSON.stringify(privateKey.slice(-40)));
console.log('Has real newlines:', privateKey.includes('\n'));
console.log('Has literal \\n:', privateKey.includes('\\n'));

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    })
  });
  console.log('SDK initialized successfully. Testing Firestore connection...');
  
  const db = admin.firestore();
  db.collection('products').limit(1).get()
    .then(snapshot => {
      console.log('SUCCESS! Firebase connected. Collection count retrieved:', snapshot.size);
      process.exit(0);
    })
    .catch(err => {
      console.error('Firestore operation failed:', err);
      process.exit(1);
    });
} catch (err) {
  console.error('Initialization CRASHED:', err);
  process.exit(1);
}
