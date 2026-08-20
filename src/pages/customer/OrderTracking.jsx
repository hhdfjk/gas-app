import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import { STATUS_ORDER, statusLabel, formatIQD } from "../../utils/orderStatus.js";

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [driverLoc, setDriverLoc] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "orders", orderId), (snap) => {
      if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
    });
    return unsub;
  }, [orderId]);

  useEffect(() => {
    if (!order || order.status !== "driver_on_way") return;
    const unsub = onSnapshot(doc(db, "driverTracking", orderId), (snap) => {
      if (snap.exists()) setDriverLoc(snap.data());
    });
    return unsub;
  }, [order?.status, orderId]);

  if (!order) return <div className="screen center"><span className="muted">جارِ التحميل...</span></div>;

  const currentIdx = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="screen">
      <div className="top-bar">
        <button className="back" onClick={() => navigate("/orders")}>→</button>
        <h2 className="display" style={{ margin: 0 }}>طلب #{order.orderNumber}</h2>
      </div>

      <div className="card center">
        <StatusBadge status={order.status} />
        {order.status === "driver_on_way" && (
          <p className="mt-8">🚚 السائق في الطريق إليك{driverLoc ? " — يتم تحديث موقعه الآن" : ""}</p>
        )}
        {order.status === "driver_arrived" && <p className="mt-8">🔔 السائق وصل إلى العنوان</p>}
      </div>

      {!isCancelled && (
        <div className="card">
          {STATUS_ORDER.map((s, i) => (
            <div key={s} className="row-between" style={{ padding: "8px 0", opacity: i <= currentIdx ? 1 : 0.4 }}>
              <span>{i <= currentIdx ? "✅" : "⚪"} {statusLabel(s)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="card stack">
        <div className="row-between"><span className="muted">نوع القنينة</span><strong>{order.productName} × {order.quantity}</strong></div>
        <div className="row-between"><span className="muted">المجموع</span><strong>{formatIQD(order.totalPrice)}</strong></div>
        <div className="row-between"><span className="muted">العنوان</span><strong>{order.address?.area} - {order.address?.street}</strong></div>
      </div>

      {order.driverId && !["delivered","cancelled"].includes(order.status) && (
        <button className="btn-outline" onClick={() => navigate(`/chat/${order.id}`)}>💬 مراسلة السائق</button>
      )}
    </div>
  );
}
