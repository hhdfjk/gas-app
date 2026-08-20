import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import BottomNav from "../../components/BottomNav.jsx";

export default function Addresses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, `users/${user.uid}/addresses`), (snap) =>
      setAddresses(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, [user]);

  async function removeAddress(id) {
    if (!confirm("حذف هذا العنوان؟")) return;
    await deleteDoc(doc(db, `users/${user.uid}/addresses`, id));
  }

  return (
    <div className="screen">
      <h2 className="display mt-8">عناويني</h2>
      {addresses.length === 0 && <div className="empty-state"><span className="flame">📍</span>لم تضف أي عنوان بعد</div>}
      <div className="stack">
        {addresses.map((a) => (
          <div key={a.id} className="card">
            <div className="row-between">
              <strong>{a.label}{a.isDefault ? " (افتراضي)" : ""}</strong>
              <button className="btn-danger" style={{ width: "auto", padding: "6px 12px", fontSize: 13 }} onClick={() => removeAddress(a.id)}>حذف</button>
            </div>
            <p className="muted mt-8" style={{ margin: 0 }}>{a.province} - {a.district} - {a.area} - {a.street}</p>
          </div>
        ))}
      </div>
      <button className="btn-primary mt-16" onClick={() => navigate("/add-address")}>+ إضافة عنوان جديد</button>
      <BottomNav />
    </div>
  );
}
