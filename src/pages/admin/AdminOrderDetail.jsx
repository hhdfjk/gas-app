import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, doc, onSnapshot, query, updateDoc, where, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase/config.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import { formatIQD, ORDER_STATUS } from "../../utils/orderStatus.js";

export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "orders", orderId), (snap) => setOrder({ id: snap.id, ...snap.data() }));
    return unsub;
  }, [orderId]);

  useEffect(() => {
    const q = query(collection(db, "drivers"), where("active", "==", true));
    const unsub = onSnapshot(q, (snap) => setDrivers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, []);

  async function setStatus(status) {
    await updateDoc(doc(db, "orders", orderId), {
      status, updatedAt: serverTimestamp(),
      statusHistory: arrayUnion({ status, timestamp: new Date().toISOString() }),
    });
  }

  async function assignDriver(driverId) {
    if (!driverId) return;
    await updateDoc(doc(db, "orders", orderId), {
      driverId, status: "driver_assigned", updatedAt: serverTimestamp(),
      statusHistory: arrayUnion({ status: "driver_assigned", timestamp: new Date().toISOString() }),
    });
    await updateDoc(doc(db, "drivers", driverId), { status: "busy", currentOrderId: orderId });
  }

  if (!order) return <div className="screen center">جارِ التحميل...</div>;

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back" onClick={() => navigate(-1)}>→</button>
        <h2 className="display" style={{ margin: 0 }}>طلب #{order.orderNumber}</h2>
      </div>

      <div className="card center"><StatusBadge status={order.status} /></div>

      <div className="card stack">
        <div className="row-between"><span className="muted">العميل</span><strong>{order.customerName}</strong></div>
        <div className="row-between"><span className="muted">الهاتف</span><strong dir="ltr">{order.customerPhone}</strong></div>
        <div className="row-between"><span className="muted">المنتج</span><strong>{order.productName} × {order.quantity}</strong></div>
        <div className="row-between"><span className="muted">المجموع</span><strong>{formatIQD(order.totalPrice)}</strong></div>
        <div className="row-between"><span className="muted">العنوان</span><strong>{order.address?.area} - {order.address?.street}</strong></div>
        {order.notes && <div className="row-between"><span className="muted">ملاحظات</span><strong>{order.notes}</strong></div>}
      </div>

      {order.status === "pending_acceptance" && (
        <div className="stack">
          <button className="btn-primary" onClick={() => setStatus("accepted")}>✅ قبول الطلب</button>
          <button className="btn-danger" onClick={() => setStatus("cancelled")}>رفض / إلغاء الطلب</button>
        </div>
      )}

      {order.status === "accepted" && (
        <button className="btn-primary mt-16" onClick={() => setStatus("preparing")}>بدء التجهيز</button>
      )}

      {order.status === "preparing" && (
        <div className="card">
          <p style={{ marginTop: 0 }}>تعيين سائق</p>
          <select defaultValue="" onChange={(e) => assignDriver(e.target.value)}>
            <option value="" disabled>اختر سائقًا متاحًا</option>
            {drivers.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.status === "available" ? "متاح" : "مشغول"})</option>)}
          </select>
        </div>
      )}

      {!["delivered","cancelled","pending_acceptance"].includes(order.status) && (
        <button className="btn-danger mt-16" onClick={() => setStatus("cancelled")}>إلغاء الطلب</button>
      )}
    </div>
  );
}
