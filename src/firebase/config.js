// ==========================================================
// إعداد الاتصال بـ Firebase
// كل هذه القيم "public config" وليست أسرارًا حساسة (وهذا طبيعي في مشاريع Firebase الويب)،
// لكن الحماية الحقيقية تكون عبر Firestore Security Rules (ملف firestore.rules)
// وليس عبر إخفاء هذه القيم.
// ==========================================================

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

// عبّئ هذه القيم من: Firebase Console > Project Settings > General > Your apps > Web app
const firebaseConfig = {
  apiKey: "AIzaSyBfv1Fkh2ezWMmMqHfJEN4NaiEhk64NQmQ",
  authDomain: "gas-maimouna.firebaseapp.com",
  projectId: "gas-maimouna",
  storageBucket: "gas-maimouna.firebasestorage.app",
  messagingSenderId: "527594920512",
  appId: "1:527594920512:web:9895fe017525e3752c5da5",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// الإشعارات تعمل فقط في بيئة متصفح تدعمها
export const getMessagingIfSupported = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};
