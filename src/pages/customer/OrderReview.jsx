import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { formatIQD, generateOrderNumber } from "../../utils/orderStatus.js";

export default function OrderReview() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);

  if (!state) { navigate("/"); return null; }
  const { product, quantity, notes, address, deliveryFee, total } = state;

  async function confirmOrder() {
    setLoading(true);
    try {
      const orderNumber = generateOrderNumber();
      const ref = await addDoc(collection(db, "orders"), {
        orderNumber,
        customerId: user.uid,
        customerName: profile?.name || "",
        customerPhone: user.phoneNumber,
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity,
        deliveryFee,
        totalPrice: total,
        address: address ? {
          label: address.label, province: address.province, district: address.district,
          area: address.area, street: address.street, landmark: address.landmark,
          lat: address.lat, lng: address.lng,
        } : null,
        notes: notes || "",
        status: "pending_acceptance",
        driverId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        statusHistory: [{ status: "pending_acceptance", timestamp: new Date().toISOString() }],
      });
      navigate(`/track/${ref.id}`, { replace: true });
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء إنشاء الطلب، حاول مرة أخرى");
    } finally { setLoading(false); }
  }

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back" onClick={() => navigate(-1)}>→</button>
        <h2 className="display" style={{ margin: 0 }}>مراجعة الطلب</h2>
      </div>

      <div className="card stack">
        <div className="row-between"><span className="muted">نوع القنينة</span><strong>{product.name}</strong></div>
        <div className="row-between"><span className="muted">الكمية</span><strong>{quantity}</strong></div>
        <div className="row-between"><span className="muted">سعر القناني</span><strong>{formatIQD(product.price * quantity)}</strong></div>
        <div className="row-between"><span className="muted">أجور التوصيل</span><strong>{formatIQD(deliveryFee)}</strong></div>
        <div className="row-between" style={{ fontSize: 18, borderTop: "1px solid var(--color-border)", paddingTop: 10 }}>
          <strong>المجموع</strong><strong style={{ color: "var(--color-accent)" }}>{formatIQD(total)}</strong>
        </div>
      </div>

      <div className="card stack">
        <div className="row-between"><span className="muted">العنوان</span><strong>{address ? `${address.area} - ${address.street}` : "—"}</strong></div>
        <div className="row-between"><span className="muted">رقم الهاتف</span><strong dir="ltr">{user.phoneNumber}</strong></div>
        {notes && <div className="row-between"><span className="muted">ملاحظات</span><strong>{notes}</strong></div>}
      </div>

      <div className="card" style={{ background: "var(--color-success-soft)", color: "var(--color-success)" }}>
        الدفع: نقدًا عند الاستلام 💵
      </div>

      <button className="btn-primary mt-16" disabled={loading} onClick={confirmOrder}>
        {loading ? <span className="spinner" /> : "تأكيد الطلب"}
      </button>
    </div>
  );
}
