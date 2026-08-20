import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { formatIQD } from "../../utils/orderStatus.js";

export default function DriverOrders() {
  const { user, profile, signOutUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "orders"), where("driverId", "==", user.uid),
      where("status", "in", ["driver_assigned","driver_on_way","driver_arrived"]));
    const unsub = onSnapshot(q, (snap) => setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, [user]);

  async function toggleAvailability() {
    const newStatus = profile?.status === "available" ? "offline" : "available";
    await updateDoc(doc(db, "drivers", user.uid), { status: newStatus });
  }

  return (
    <div className="screen">
      <div className="row-between mt-8">
        <div>
          <p className="muted">مرحبًا</p>
          <h2 className="display" style={{ margin: 0 }}>{profile?.name}</h2>
        </div>
        <button className="btn-outline" style={{ width: "auto", padding: "8px 14px" }} onClick={toggleAvailability}>
          {profile?.status === "available" ? "🟢 متاح" : "⚪ غير متاح"}
        </button>
      </div>

      <h3 className="display mt-24">طلباتي المسندة</h3>
      {orders.length === 0 && <div className="empty-state"><span className="flame">🚚</span>لا توجد طلبات مسندة إليك حاليًا</div>}
      <div className="stack">
        {orders.map((o) => (
          <div key={o.id} className="card" onClick={() => navigate(`/driver/order/${o.id}`)}>
            <div className="row-between">
              <strong>#{o.orderNumber}</strong>
              <StatusBadge status={o.status} />
            </div>
            <p className="muted mt-8" style={{ margin: "6px 0" }}>{o.productName} × {o.quantity} — {formatIQD(o.totalPrice)}</p>
            <p style={{ margin: 0 }}>📍 {o.address?.area} - {o.address?.street}</p>
          </div>
        ))}
      </div>
      <button className="btn-danger mt-24" onClick={signOutUser}>تسجيل الخروج</button>
    </div>
  );
}
