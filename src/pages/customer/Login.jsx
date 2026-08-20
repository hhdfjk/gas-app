import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function Login() {
  const { sendOtp } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    setError("");
    const digits = phone.replace(/[^0-9]/g, "");
    if (digits.length < 10) { setError("أدخل رقم هاتف عراقي صحيح"); return; }
    const local = digits.startsWith("0") ? digits.slice(1) : digits;
    const e164 = `+964${local}`;
    setLoading(true);
    try {
      await sendOtp(e164);
      navigate("/verify-otp", { state: { phone: e164 } });
    } catch (e) {
      setError("تعذر إرسال رمز التحقق. حاول مرة أخرى.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back" onClick={() => navigate(-1)}>→</button>
      </div>
      <h2 className="display">تسجيل الدخول</h2>
      <p className="muted">أدخل رقم هاتفك وسنرسل لك رمز تحقق</p>
      <div className="mt-24 stack">
        <input
          type="tel" inputMode="numeric" placeholder="07xxxxxxxxx"
          value={phone} onChange={(e) => setPhone(e.target.value)}
          dir="ltr" style={{ textAlign: "center", letterSpacing: 1 }}
        />
        {error && <p style={{ color: "var(--color-danger)", fontSize: 14 }}>{error}</p>}
        <button className="btn-primary" disabled={loading} onClick={handleSend}>
          {loading ? <span className="spinner" /> : "إرسال رمز التحقق"}
        </button>
      </div>
    </div>
  );
}
