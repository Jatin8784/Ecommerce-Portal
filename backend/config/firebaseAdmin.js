import admin from "firebase-admin";

// On Render/Production, we use an Environment Variable for security
// On Local, we fall back to the file if it exists, or just use the env var
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT env var not found. Firebase Admin not initialized.");
}

export default admin;
