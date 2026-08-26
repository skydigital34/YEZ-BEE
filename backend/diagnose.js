const admin = require('firebase-admin');

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'yezbee-fashion';
  admin.initializeApp({ projectId });
}

const db = admin.firestore();

async function diagnose() {
  console.log('Diagnosing Firebase Firestore...');
  const snapshot = await db.collection('products').get();
  const total = snapshot.size;

  const categoryDist = {};
  const statusDist = {};

  snapshot.docs.forEach(doc => {
    const p = doc.data();
    const cat = p.category ? String(p.category) : 'MISSING';
    categoryDist[cat] = (categoryDist[cat] || 0) + 1;
    const st = p.status || 'MISSING';
    statusDist[st] = (statusDist[st] || 0) + 1;
  });

  console.log(JSON.stringify({
    totalProducts: total,
    categoryDist,
    statusDist,
    timestamp: new Date().toISOString()
  }, null, 2));

  process.exit(0);
}

diagnose().catch(e => {
  console.error('DIAG ERROR:', e);
  process.exit(1);
});
