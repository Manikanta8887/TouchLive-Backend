import admin from "firebase-admin";

const getFirebaseAdmin = () => {
  const apps = admin && admin.apps ? admin.apps : [];
  if (!apps.length) {
    try {
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          }),
        });
      } else {
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || "touch-live-7a1f8",
        });
      }
      console.log("🔥 Firebase Admin initialized successfully");
    } catch (error) {
      console.warn("⚠️ Firebase Admin initialization warning:", error.message);
    }
  }
  return admin;
};

const firebaseAdmin = getFirebaseAdmin();
export default firebaseAdmin;
