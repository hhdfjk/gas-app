import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function VerifyOtp() {
  const { verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleVerify() {
    setError("");
    if (code.length < 6) { setError("أدخل الرمز المكوّن من 6 أرقام"); return; }
    setLoading(true);
    try {
      await verifyOtp(code);
      navigate("/", { replace: true });
    } catch (e) {
      setError("الرمز غير صحيح، حاول مرة أخرى.");
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
      <h2 className="display">أدخل رمز التحقق</h2>
      <p className="muted">تم إرسال رمز مكوّن من 6 أرقام إلى {phone}</p>
      <div className="mt-24 stack">
        <input
          type="tel" inputMode="numeric" maxLength={6} placeholder="------"
          value={code} onChange={(e) => setCode(e.target.value)}
          dir="ltr" style={{ textAlign: "center", fontSize: 24, letterSpacing: 8 }}
        />
        {error && <p style={{ color: "var(--color-danger)", fontSize: 14 }}>{error}</p>}
        <button className="btn-primary" disabled={loading} onClick={handleVerify}>
          {loading ? <span className="spinner" /> : "تأكيد"}
        </button>
      </div>
    </div>
  );
}
