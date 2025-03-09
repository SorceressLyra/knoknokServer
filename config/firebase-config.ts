import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

export const initializeFirebase = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
};
