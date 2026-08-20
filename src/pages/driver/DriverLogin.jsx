import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function DriverLogin() {
  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("phone"); // phone | otp
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    setError("");
    const digits = phone.replace(/[^0-9]/g, "");
    if (digits.length < 10) { setError("أدخل رقم هاتف صحيح"); return; }
    const local = digits.startsWith("0") ? digits.slice(1) : digits;
    setLoading(true);
    try {
      await sendOtp(`+964${local}`);
      setStep("otp");
    } catch (e) { setError("تعذر إرسال رمز التحقق"); console.error(e); }
    finally { setLoading(false); }
  }

  async function handleVerify() {
    setError("");
    setLoading(true);
    try {
      await verifyOtp(code);
      navigate("/driver", { replace: true });
    } catch (e) { setError("الرمز غير صحيح"); console.error(e); }
    finally { setLoading(false); }
  }

  return (
    <div className="screen" style={{ paddingTop: 60 }}>
      <div className="center"><span style={{ fontSize: 50 }}>🚚</span>
        <h2 className="display">دخول السائق</h2>
      </div>
      <div className="stack mt-24">
        {step === "phone" ? (
          <>
            <input type="tel" placeholder="07xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" style={{ textAlign: "center" }} />
            {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
            <button className="btn-primary" disabled={loading} onClick={handleSend}>{loading ? <span className="spinner" /> : "إرسال رمز التحقق"}</button>
          </>
        ) : (
          <>
            <input type="tel" maxLength={6} placeholder="------" value={code} onChange={(e) => setCode(e.target.value)} dir="ltr" style={{ textAlign: "center", letterSpacing: 8, fontSize: 22 }} />
            {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
            <button className="btn-primary" disabled={loading} onClick={handleVerify}>{loading ? <span className="spinner" /> : "تأكيد الدخول"}</button>
          </>
        )}
      </div>
    </div>
  );
}
