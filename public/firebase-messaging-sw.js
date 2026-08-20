// هذا الملف يستقبل إشعارات Push عندما يكون التطبيق مغلقًا أو في الخلفية
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

// انسخ نفس القيم من src/firebase/config.js هنا (لا يمكن استيراد ملفات ES Module داخل service worker)
firebase.initializeApp({
  apiKey: "AIzaSyBfv1Fkh2ezWMmMqHfJEN4NaiEhk64NQmQ",
  authDomain: "gas-maimouna.firebaseapp.com",
  projectId: "gas-maimouna",
  storageBucket: "gas-maimouna.firebasestorage.app",
  messagingSenderId: "527594920512",
  appId: "1:527594920512:web:9895fe017525e3752c5da5",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "إشعار جديد", {
    body: body || "",
    icon: "/icon-192.png",
  });
});
