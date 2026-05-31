import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp, auth: any, db: any, storage: any, analytics: any;

if (typeof window !== "undefined" || process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    // Initialize Firebase only if there are no existing apps
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        db = initializeFirestore(app, {
            experimentalForceLongPolling: true
        });
    } else {
        app = getApp();
        db = getFirestore(app);
    }

    auth = getAuth(app);
    storage = getStorage(app);

    if (typeof window !== "undefined") {
        isSupported().then((supported) => {
            if (supported) {
                analytics = getAnalytics(app);
            }
        });
    }
}

export { app, auth, db, storage, analytics };
