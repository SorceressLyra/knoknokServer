import admin from 'firebase-admin';
import path from 'path';

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

export const initializeFirebase = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
};
