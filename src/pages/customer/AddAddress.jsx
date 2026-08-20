import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase/config.js";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function AddAddress() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({
    label: "البيت", province: "الأنبار", district: "قضاء الميمونة",
    area: "", street: "", landmark: "", lat: null, lng: null,
  });
  const [loading, setLoading] = useState(false);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  function useCurrentLocation() {
    if (!navigator.geolocation) { alert("المتصفح لا يدعم تحديد الموقع"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => update("lat", pos.coords.latitude) || update("lng", pos.coords.longitude),
      () => alert("تعذر تحديد موقعك، تأكد من تفعيل صلاحية الموقع"),
      { enableHighAccuracy: true }
    );
  }

  async function save() {
    if (!form.area || !form.street) { alert("أدخل المنطقة والشارع على الأقل"); return; }
    setLoading(true);
    try {
      await addDoc(collection(db, `users/${user.uid}/addresses`), { ...form, isDefault: true });
      if (state?.returnTo) navigate(state.returnTo, { state: { product: state.product } });
      else navigate("/addresses");
    } finally { setLoading(false); }
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back" onClick={() => navigate(-1)}>→</button>
        <h2 className="display" style={{ margin: 0 }}>إضافة عنوان</h2>
      </div>
      <div className="stack">
        <input placeholder="تسمية (البيت، العمل...)" value={form.label} onChange={(e) => update("label", e.target.value)} />
        <input placeholder="المنطقة/الحي" value={form.area} onChange={(e) => update("area", e.target.value)} />
        <input placeholder="الشارع" value={form.street} onChange={(e) => update("street", e.target.value)} />
        <input placeholder="أقرب نقطة دالة" value={form.landmark} onChange={(e) => update("landmark", e.target.value)} />
        <button className="btn-outline" onClick={useCurrentLocation}>
          📍 {form.lat ? "تم تحديد موقعك الحالي ✓" : "استخدام موقعي الحالي"}
        </button>
        <button className="btn-primary" disabled={loading} onClick={save}>
          {loading ? <span className="spinner" /> : "حفظ العنوان"}
        </button>
      </div>
    </div>
  );
}
