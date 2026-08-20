import React, { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config.js";
import AdminNav from "./AdminNav.jsx";
import { formatIQD } from "../../utils/orderStatus.js";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "" });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a,b) => (a.sortOrder||0)-(b.sortOrder||0)));
    });
    return unsub;
  }, []);

  async function addProduct() {
    if (!form.name || !form.price) return alert("أدخل الاسم والسعر");
    await addDoc(collection(db, "products"), {
      name: form.name, price: Number(form.price), active: true,
      sortOrder: products.length + 1, updatedAt: serverTimestamp(),
    });
    setForm({ name: "", price: "" });
  }

  async function updatePrice(id, price) {
    await updateDoc(doc(db, "products", id), { price: Number(price), updatedAt: serverTimestamp() });
  }

  async function toggleActive(id, active) {
    await updateDoc(doc(db, "products", id), { active: !active });
  }

  async function removeProduct(id) {
    if (!confirm("حذف هذا النوع من القناني؟")) return;
    await deleteDoc(doc(db, "products", id));
  }

  return (
    <div className="screen">
      <h2 className="display mt-8">إدارة أنواع القناني</h2>

      <div className="card stack">
        <input placeholder="اسم النوع (مثال: القنينة الاقتصادية)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="number" placeholder="السعر بالدينار" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <button className="btn-primary" onClick={addProduct}>+ إضافة نوع جديد</button>
      </div>

      <div className="stack mt-16">
        {products.map((p) => (
          <div key={p.id} className="card">
            <div className="row-between"><strong>{p.name}</strong>
              <span className={`badge ${p.active ? "badge-success" : "badge-danger"}`}>{p.active ? "مفعّل" : "معطّل"}</span>
            </div>
            <div className="row-between mt-8">
              <input type="number" defaultValue={p.price} style={{ width: 140 }}
                onBlur={(e) => e.target.value != p.price && updatePrice(p.id, e.target.value)} />
              <strong>{formatIQD(p.price)}</strong>
            </div>
            <div className="row-between mt-8" style={{ gap: 8 }}>
              <button className="btn-outline" style={{ fontSize: 13 }} onClick={() => toggleActive(p.id, p.active)}>{p.active ? "تعطيل" : "تفعيل"}</button>
              <button className="btn-danger" style={{ fontSize: 13 }} onClick={() => removeProduct(p.id)}>حذف</button>
            </div>
          </div>
        ))}
      </div>
      <AdminNav />
    </div>
  );
}
