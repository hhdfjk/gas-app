import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import AdminNav from "./AdminNav.jsx";
import { formatIQD } from "../../utils/orderStatus.js";

const FILTERS = [
  { key: "all", label: "الكل" },
  { key: "pending_acceptance", label: "بانتظار القبول" },
  { key: "driver_on_way", label: "قيد التوصيل" },
  { key: "delivered", label: "مكتملة" },
  { key: "cancelled", label: "ملغاة" },
];

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="screen">
      <h2 className="display mt-8">لوحة الإدارة — الطلبات</h2>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={filter === f.key ? "btn-primary" : "btn-outline"}
            style={{ width: "auto", whiteSpace: "nowrap", padding: "8px 14px", fontSize: 13 }}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="stack mt-16">
        {filtered.length === 0 && <p className="muted center mt-24">لا توجد طلبات ضمن هذا التصنيف</p>}
        {filtered.map((o) => (
          <div key={o.id} className="card" onClick={() => navigate(`/admin/order/${o.id}`)}>
            <div className="row-between">
              <strong>#{o.orderNumber}</strong>
              <StatusBadge status={o.status} />
            </div>
            <p className="muted mt-8" style={{ margin: "6px 0" }}>{o.customerName} — {o.customerPhone}</p>
            <div className="row-between">
              <span>{o.productName} × {o.quantity}</span>
              <strong>{formatIQD(o.totalPrice)}</strong>
            </div>
          </div>
        ))}
      </div>
      <AdminNav />
    </div>
  );
}
