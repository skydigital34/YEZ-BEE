import * as admin from 'firebase-admin';
import { logger } from '../utils/helpers';

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

export const initializeFirebase = (): { db: admin.firestore.Firestore; auth: admin.auth.Auth } => {
  if (admin.apps.length > 0) {
    const app = admin.app();
    db = admin.firestore(app);
    auth = admin.auth(app);
    return { db, auth };
  }

  try {
    const projectId = (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'yezbee-5944b').replace(/^"|"$/g, '').trim();
    let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (clientEmail) {
      clientEmail = clientEmail.trim();
      if (clientEmail.startsWith('"') && clientEmail.endsWith('"')) {
        clientEmail = clientEmail.slice(1, -1);
      }
      if (clientEmail.startsWith("'") && clientEmail.endsWith("'")) {
        clientEmail = clientEmail.slice(1, -1);
      }
    }

    if (privateKey) {
      let cleanKey = privateKey.trim();
      if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) {
        cleanKey = cleanKey.slice(1, -1);
      }
      if (cleanKey.startsWith("'") && cleanKey.endsWith("'")) {
        cleanKey = cleanKey.slice(1, -1);
      }
      cleanKey = cleanKey.replace(/\\n/g, '\n').trim();
      while (cleanKey.endsWith('\\') || cleanKey.endsWith('\n') || cleanKey.endsWith('\r')) {
        cleanKey = cleanKey.slice(0, -1).trim();
      }
      privateKey = cleanKey;
      console.log('Backend Firebase Init Private Key Debug:', {
        length: privateKey?.length,
        startsWith: privateKey?.slice(0, 30),
        endsWith: privateKey?.slice(-30),
        hasRealNewlines: privateKey?.includes('\n'),
        hasLiteralNewlines: privateKey?.includes('\\n'),
      });
    }

    if (clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      logger.info('Firebase Admin SDK initialized with Service Account certificate');
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT_JSON.replace(/^"|"$/g, '').trim();
      const serviceAccount = JSON.parse(serviceAccountStr);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      logger.info('Firebase Admin SDK initialized with Service Account JSON');
    } else {
      // Fallback initialization with Project ID for development / emulator / default app credentials
      admin.initializeApp({
        projectId,
      });
      logger.warn(`Firebase Admin SDK initialized with fallback Project ID: ${projectId}. For full Firestore access, set FIREBASE_CLIENT_EMAIL & FIREBASE_PRIVATE_KEY in .env`);
    }

    db = admin.firestore();
    auth = admin.auth();

    // Disable legacy timestamp settings
    try {
      db.settings({ ignoreUndefinedProperties: true });
    } catch {
      // Settings already configured
    }

    return { db, auth };
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
};

const getDb = (): admin.firestore.Firestore => {
  if (!db) {
    initializeFirebase();
  }
  return db;
};

const getAuth = (): admin.auth.Auth => {
  if (!auth) {
    initializeFirebase();
  }
  return auth;
};

export { getDb, getAuth, admin };
export default getDb;
