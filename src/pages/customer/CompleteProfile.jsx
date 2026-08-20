import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function CompleteProfile() {
  const { completeCustomerProfile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await completeCustomerProfile(name.trim());
      navigate("/", { replace: true });
    } finally { setLoading(false); }
  }

  return (
    <div className="screen">
      <h2 className="display mt-24">مرحبًا بك 👋</h2>
      <p className="muted">أدخل اسمك لإكمال إنشاء الحساب</p>
      <div className="mt-24 stack">
        <input placeholder="الاسم الكامل" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn-primary" disabled={loading || !name.trim()} onClick={handleSave}>
          {loading ? <span className="spinner" /> : "متابعة"}
        </button>
      </div>
    </div>
  );
}
