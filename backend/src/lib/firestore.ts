import { admin, getDb } from '../config/firebase';

/**
 * Initialize Firebase Admin and expose Firestore instance.
 * This wrapper provides a singleton Firestore DB and a helper `guard`
 * to safely coerce `string | undefined` into a definite string.
 */

export const initFirebase = (): { db: admin.firestore.Firestore; auth: admin.auth.Auth } => {
  // The firebase config file already does lazy init; we just forward it.
  return { db: getDb(), auth: admin.auth() };
};

/** Guard utility – ensures a string value (fallback to empty string). */
export const guard = (val: string | undefined, fallback = ''): string => {
  return val ?? fallback;
};

export { getDb } from '../config/firebase';
