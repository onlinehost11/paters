import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyDqzK38p9dG5YriZz3y66yDrmNjSeyGSas',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'paters-group.firebaseapp.com',
    projectId: process.env.FIREBASE_PROJECT_ID || 'paters-group',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'paters-group.firebasestorage.app',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '548925676619',
    appId: process.env.FIREBASE_APP_ID || '1:548925676619:web:b1ea6edb5d0f12c49641ce',
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-7QQ4M1CSWZ'
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Analytics (optional)
let analytics;
try {
    analytics = getAnalytics(firebaseApp);
} catch (error) {
    console.log('Analytics not available in Node.js environment');
}

// Export Firebase services
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseDb = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);
export { analytics };

export default firebaseApp;