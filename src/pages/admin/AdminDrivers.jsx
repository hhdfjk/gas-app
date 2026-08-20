import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../../firebase/config.js";
import AdminNav from "./AdminNav.jsx";

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "drivers"), (snap) => setDrivers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, []);

  async function toggleActive(driverId, active) {
    await updateDoc(doc(db, "drivers", driverId), { active: !active });
  }

  return (
    <div className="screen">
      <h2 className="display mt-8">إدارة السائقين</h2>
      <p className="muted">
        السائق يسجّل دخوله برقم هاتفه عبر شاشة "دخول السائق" في التطبيق (نفس نظام OTP).
        بعد أول تسجيل دخول له، انسخ الـ UID من Firebase Authentication وأضف مستندًا بنفس المعرف
        في مجموعة <b>drivers</b> يدويًا من Firebase Console، أو استخدم النموذج أدناه إذا كان لديك الـ UID جاهزًا.
      </p>

      <button className="btn-outline" onClick={() => setShowForm((v) => !v)}>+ إضافة سائق (بمعرف UID)</button>
      {showForm && (
        <div className="card stack mt-16">
          <input placeholder="UID الخاص بحساب السائق" value={form.uid || ""} onChange={(e) => setForm({ ...form, uid: e.target.value })} dir="ltr" />
          <input placeholder="اسم السائق" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} dir="ltr" />
          <button className="btn-primary" onClick={async () => {
            if (!form.uid || !form.name) return alert("أدخل UID والاسم");
            await setDoc(doc(db, "drivers", form.uid), {
              uid: form.uid, name: form.name, phone: form.phone, active: true,
              status: "offline", currentOrderId: null, createdAt: serverTimestamp(),
            });
            setForm({ name: "", phone: "" }); setShowForm(false);
          }}>حفظ السائق</button>
        </div>
      )}

      <div className="stack mt-16">
        {drivers.map((d) => (
          <div key={d.id} className="card">
            <div className="row-between">
              <strong>{d.name}</strong>
              <span className={`badge ${d.status === "available" ? "badge-success" : d.status === "busy" ? "badge-active" : "badge-pending"}`}>
                {d.status === "available" ? "متاح" : d.status === "busy" ? "مشغول" : "غير متصل"}
              </span>
            </div>
            <p className="muted" dir="ltr" style={{ margin: "6px 0" }}>{d.phone}</p>
            <button className={d.active ? "btn-danger" : "btn-primary"} onClick={() => toggleActive(d.id, d.active)}>
              {d.active ? "تعطيل الحساب" : "تفعيل الحساب"}
            </button>
          </div>
        ))}
      </div>
      <AdminNav />
    </div>
  );
}
