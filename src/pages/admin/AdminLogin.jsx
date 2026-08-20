import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(""); setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin", { replace: true });
    } catch (e) {
      setError("بيانات الدخول غير صحيحة");
    } finally { setLoading(false); }
  }

  return (
    <div className="screen" style={{ paddingTop: 80 }}>
      <div className="center"><span style={{ fontSize: 46 }}>🛠️</span><h2 className="display">دخول لوحة الإدارة</h2></div>
      <div className="stack mt-24">
        <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
        <input type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
        {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
        <button className="btn-primary" disabled={loading} onClick={handleLogin}>{loading ? <span className="spinner" /> : "دخول"}</button>
      </div>
      <p className="muted mt-24 center">يُنشأ حساب المدير من Firebase Console (Authentication → Email/Password)، ثم تُضاف بياناته إلى مجموعة admins كما هو موضح في README.</p>
    </div>
  );
}
