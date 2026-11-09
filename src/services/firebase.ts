import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, Analytics } from 'firebase/analytics';

/**
 * FIREBASE KONFIGURATSIYASI — TAKLIFIM.UZ (teklifim-9dae7)
 * -------------------------------------------------------
 * Foydalanuvchining haqiqiy Firebase loyiha kalitlari
 */
export const firebaseConfig = {
  apiKey: "AIzaSyAwLudjK-S9jcApB-GXfOdHEj_EuRhaEK8",
  authDomain: "teklifim-9dae7.firebaseapp.com",
  projectId: "teklifim-9dae7",
  storageBucket: "teklifim-9dae7.firebasestorage.app",
  messagingSenderId: "233634192535",
  appId: "1:233634192535:web:a7536a57488f137dbf1dd2",
  measurementId: "G-BP39X9V59Z"
};

/**
 * Firebase haqiqiy kalitlar bilan sozlanganligini tekshirish
 */
export const isFirebaseConfigured = (): boolean => {
  return (
    Boolean(firebaseConfig.apiKey) &&
    firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
    Boolean(firebaseConfig.projectId) &&
    firebaseConfig.projectId !== 'YOUR_PROJECT_ID'
  );
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let analytics: Analytics | null = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    // Analytics faqat browser muhitida ishlaydi
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
    console.log('🔥 Firebase muvaffaqiyatli ulandi! Loyiha: teklifim-9dae7');
  } catch (err) {
    console.warn('Firebase ishga tushirishda xatolik:', err);
  }
} else {
  console.info(
    'ℹ️ Firebase sozlanmagan. Real-Time Local Store faol.'
  );
}

export { app, db, auth, analytics };
