import { initializeFirebase, getDb } from './firebase';
import { logger } from '../utils/helpers';

let isConnected = false;

export const connectDatabase = async (): Promise<void> => {
  try {
    initializeFirebase();
    const db = getDb();
    
    // Quick ping to check Firestore connectivity
    await db.collection('_health').doc('ping').set({
      timestamp: new Date().toISOString(),
      status: 'online'
    }, { merge: true });

    isConnected = true;
    logger.info('Firebase Firestore connected successfully!');
  } catch (error: any) {
    logger.error('Firebase Firestore connection error:', error?.message || error);
    // Don't crash server start if network is temporarily down
    isConnected = false;
  }
};

export const getDatabaseStatus = (): boolean => isConnected;

export default connectDatabase;
