import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, onSnapshot, updateDoc, serverTimestamp, setDoc, deleteDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase/config.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { formatIQD } from "../../utils/orderStatus.js";

const NEXT_ACTION = {
  driver_assigned: { next: "driver_on_way", label: "بدء التوصيل 🚚" },
  driver_on_way: { next: "driver_arrived", label: "وصلت 🔔" },
  driver_arrived: { next: "delivered", label: "تم التسليم ✅" },
};

export default function DriverOrderDetail() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "orders", orderId), (snap) => setOrder({ id: snap.id, ...snap.data() }));
    return unsub;
  }, [orderId]);

  // تتبع الموقع الحي فقط أثناء "السائق في الطريق" لتقليل استهلاك البطارية
  useEffect(() => {
    if (order?.status === "driver_on_way" && navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          await setDoc(doc(db, "driverTracking", orderId), {
            driverId: user.uid, lat: pos.coords.latitude, lng: pos.coords.longitude, updatedAt: serverTimestamp(),
          });
        },
        (err) => console.error(err),
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }
    return () => { if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current); };
  }, [order?.status, orderId, user]);

  async function advanceStatus() {
    const action = NEXT_ACTION[order.status];
    if (!action) return;
    await updateDoc(doc(db, "orders", orderId), {
      status: action.next,
      updatedAt: serverTimestamp(),
      statusHistory: arrayUnion({ status: action.next, timestamp: new Date().toISOString() }),
    });
    if (action.next === "delivered") {
      await updateDoc(doc(db, "drivers", user.uid), { status: "available", currentOrderId: null });
      await deleteDoc(doc(db, "driverTracking", orderId)).catch(() => {});
    }
  }

  function openMap() {
    if (!order?.address?.lat) { alert("لا يوجد موقع GPS محفوظ لهذا العنوان"); return; }
    window.open(`https://www.google.com/maps?q=${order.address.lat},${order.address.lng}`, "_blank");
  }

  if (!order) return <div className="screen center">جارِ التحميل...</div>;
  const action = NEXT_ACTION[order.status];

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
        <div className="row-between"><span className="muted">المجموع (نقدًا)</span><strong>{formatIQD(order.totalPrice)}</strong></div>
        {order.notes && <div className="row-between"><span className="muted">ملاحظات</span><strong>{order.notes}</strong></div>}
      </div>

      <div className="card">
        <p style={{ marginTop: 0 }}>📍 {order.address?.area} - {order.address?.street}</p>
        <p className="muted" style={{ margin: 0 }}>{order.address?.landmark}</p>
        <button className="btn-outline mt-16" onClick={openMap}>فتح الموقع على الخريطة</button>
      </div>

      <div className="stack">
        <button className="btn-outline" onClick={() => navigate(`/chat/${order.id}`)}>💬 مراسلة العميل</button>
        {action && <button className="btn-primary" onClick={advanceStatus}>{action.label}</button>}
      </div>
    </div>
  );
}
