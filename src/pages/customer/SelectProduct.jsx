import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { formatIQD } from "../../utils/orderStatus.js";

export default function SelectProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [product] = useState(location.state?.product);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [addressId, setAddressId] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [deliveryFee] = useState(1000); // يمكن جعلها حسب المنطقة لاحقًا من الإعدادات

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/addresses`), orderBy("isDefault", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAddresses(list);
      if (list.length && !addressId) setAddressId(list[0].id);
    });
    return unsub;
  }, [user]);

  if (!product) { navigate("/"); return null; }

  const total = product.price * quantity + deliveryFee;

  function goReview() {
    const address = addresses.find((a) => a.id === addressId);
    navigate("/order-review", { state: { product, quantity, notes, address, deliveryFee, total } });
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back" onClick={() => navigate(-1)}>→</button>
        <h2 className="display" style={{ margin: 0 }}>{product.name}</h2>
      </div>

      <div className="card">
        <div className="row-between">
          <span>سعر القنينة</span><strong>{formatIQD(product.price)}</strong>
        </div>
      </div>

      <div className="card">
        <p style={{ marginTop: 0 }}>الكمية</p>
        <div className="row-between">
          <button className="btn-outline" style={{ width: 48 }} onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
          <strong style={{ fontSize: 20 }}>{quantity}</strong>
          <button className="btn-outline" style={{ width: 48 }} onClick={() => setQuantity(quantity + 1)}>+</button>
        </div>
      </div>

      <div className="card">
        <p style={{ marginTop: 0 }}>عنوان التوصيل</p>
        {addresses.length === 0 ? (
          <button className="btn-outline" onClick={() => navigate("/add-address", { state: { returnTo: "/select-product", product } })}>
            + إضافة عنوان
          </button>
        ) : (
          <select value={addressId} onChange={(e) => setAddressId(e.target.value)}>
            {addresses.map((a) => (
              <option key={a.id} value={a.id}>{a.label} - {a.area} - {a.street}</option>
            ))}
          </select>
        )}
      </div>

      <div className="card">
        <p style={{ marginTop: 0 }}>ملاحظات إضافية (اختياري)</p>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="مثال: اترك القنينة عند الباب" />
      </div>

      <div className="card stack">
        <div className="row-between"><span className="muted">سعر القناني</span><span>{formatIQD(product.price * quantity)}</span></div>
        <div className="row-between"><span className="muted">أجور التوصيل</span><span>{formatIQD(deliveryFee)}</span></div>
        <div className="row-between" style={{ fontSize: 18 }}><strong>المجموع</strong><strong>{formatIQD(total)}</strong></div>
      </div>

      <button className="btn-primary mt-16" disabled={!addressId} onClick={goReview}>متابعة الطلب</button>
    </div>
  );
}
