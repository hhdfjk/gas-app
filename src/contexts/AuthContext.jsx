import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged, signOut as fbSignOut,
  RecaptchaVerifier, signInWithPhoneNumber,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { auth, db, getMessagingIfSupported } from "../firebase/config.js";

// حفظ رمز الإشعارات (FCM) لحساب المستخدم بحسب دوره
async function saveFcmToken(uid, collectionName) {
  try {
    const messaging = await getMessagingIfSupported();
    if (!messaging || !("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;
    // ملاحظة: استبدل vapidKey بمفتاح "Web Push certificates" من Firebase Console > Cloud Messaging
    const token = await getToken(messaging, { vapidKey: "PASTE_VAPID_KEY_HERE" }).catch(() => null);
    if (token) await updateDoc(doc(db, collectionName, uid), { fcmToken: token });
  } catch (e) {
    console.warn("تعذر تفعيل الإشعارات:", e.message);
  }
}

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // "customer" | "driver" | "admin"
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (!fbUser) {
        setRole(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      // ترتيب الفحص: مدير ثم سائق ثم عميل
      const adminSnap = await getDoc(doc(db, "admins", fbUser.uid));
      if (adminSnap.exists()) {
        setRole("admin");
        setProfile({ id: fbUser.uid, ...adminSnap.data() });
        setLoading(false);
        saveFcmToken(fbUser.uid, "admins");
        return;
      }
      const driverSnap = await getDoc(doc(db, "drivers", fbUser.uid));
      if (driverSnap.exists()) {
        setRole("driver");
        setProfile({ id: fbUser.uid, ...driverSnap.data() });
        setLoading(false);
        saveFcmToken(fbUser.uid, "drivers");
        return;
      }
      const userSnap = await getDoc(doc(db, "users", fbUser.uid));
      if (userSnap.exists()) {
        setRole("customer");
        setProfile({ id: fbUser.uid, ...userSnap.data() });
        saveFcmToken(fbUser.uid, "users");
      } else {
        setRole("new_customer"); // مسجّل بالهاتف لكن لم يكمل إنشاء الحساب بعد
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // إعداد reCAPTCHA (مطلوب من Firebase لتفعيل تسجيل الدخول برقم الهاتف على الويب)
  function ensureRecaptcha() {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
    return window.recaptchaVerifier;
  }

  async function sendOtp(phoneNumberE164) {
    const verifier = ensureRecaptcha();
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumberE164, verifier);
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  }

  async function verifyOtp(code) {
    if (!window.confirmationResult) throw new Error("لم يتم إرسال رمز تحقق بعد");
    const result = await window.confirmationResult.confirm(code);
    return result.user;
  }

  async function completeCustomerProfile(name) {
    if (!user) throw new Error("غير مسجل الدخول");
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      phone: user.phoneNumber,
      createdAt: serverTimestamp(),
    });
    setRole("customer");
    setProfile({ id: user.uid, name, phone: user.phoneNumber });
  }

  async function signOutUser() {
    await fbSignOut(auth);
  }

  const value = { user, role, profile, loading, sendOtp, verifyOtp, completeCustomerProfile, signOutUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
