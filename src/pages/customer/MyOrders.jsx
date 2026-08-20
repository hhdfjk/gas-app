import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import BottomNav from "../../components/BottomNav.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { formatIQD } from "../../utils/orderStatus.js";

export default function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "orders"), where("customerId", "==", user.uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, [user]);

  return (
    <div className="screen">
      <h2 className="display mt-8">طلباتي</h2>
      {orders.length === 0 && (
        <div className="empty-state"><span className="flame">📦</span>لا توجد طلبات بعد</div>
      )}
      <div className="stack">
        {orders.map((o) => (
          <div key={o.id} className="card" onClick={() => navigate(`/track/${o.id}`)}>
            <div className="row-between">
              <strong>#{o.orderNumber}</strong>
              <StatusBadge status={o.status} />
            </div>
            <p className="muted mt-8" style={{ margin: 0 }}>{o.productName} × {o.quantity} — {formatIQD(o.totalPrice)}</p>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
