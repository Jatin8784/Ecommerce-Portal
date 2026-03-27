import admin from "firebase-admin";
import { readFileSync } from "fs";

// TODO: Download your service account JSON from Firebase Console -> Project Settings -> Service Accounts
// Save it as 'backend/config/firebase-service-account.json'
const serviceAccount = JSON.parse(
  readFileSync(new URL("./firebase-service-account.json", import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;
