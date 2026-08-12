import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if present
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const SYSTEM_DOC_REF = doc(db, 'sistema', 'data');

/**
 * Listens for real-time changes to the financial system data in Firestore.
 */
export function subscribeToSistemaData(onData: (data: any) => void) {
  return onSnapshot(
    SYSTEM_DOC_REF,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data());
      } else {
        onData(null);
      }
    },
    (error) => {
      console.error('Firestore listener error:', error);
    }
  );
}

/**
 * Saves or updates the financial system data in Firestore.
 */
export async function saveSistemaDataToCloud(data: any) {
  try {
    await setDoc(SYSTEM_DOC_REF, {
      ...data,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving data to Firestore:', error);
    throw error;
  }
}

/**
 * Fetches the financial system data from Firestore once.
 */
export async function getSistemaDataFromCloud() {
  try {
    const snap = await getDoc(SYSTEM_DOC_REF);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting data from Firestore:', error);
    return null;
  }
}
