import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import BottomNav from "../../components/BottomNav.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { formatIQD } from "../../utils/orderStatus.js";

export default function Home() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "products"), where("active", "==", true));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setProducts(list);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "orders"),
      where("customerId", "==", user.uid),
      where("status", "in", ["pending_acceptance","accepted","preparing","driver_assigned","driver_on_way","driver_arrived"]),
      orderBy("createdAt", "desc"), limit(1)
    );
    const unsub = onSnapshot(q, (snap) => {
      setActiveOrder(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() });
    });
    return unsub;
  }, [user]);

  return (
    <div className="screen">
      <div className="row-between mt-8">
        <div>
          <p className="muted">أهلًا بك 👋</p>
          <h2 className="display" style={{ margin: 0 }}>{profile?.name || "عميلنا العزيز"}</h2>
        </div>
        <span style={{ fontSize: 30 }}>🔥</span>
      </div>

      {activeOrder && (
        <div className="card mt-16" style={{ borderRight: "4px solid var(--color-accent)" }} onClick={() => navigate(`/track/${activeOrder.id}`)}>
          <div className="row-between">
            <strong>طلب جارٍ #{activeOrder.orderNumber}</strong>
            <StatusBadge status={activeOrder.status} />
          </div>
          <p className="muted mt-8">اضغط لمتابعة حالة الطلب مباشرة</p>
        </div>
      )}

      <h3 className="display mt-24">اطلب قنينة الغاز الآن</h3>
      <div className="stack mt-8">
        {products.length === 0 && <p className="muted">لا توجد أنواع قناني متاحة حاليًا</p>}
        {products.map((p) => (
          <div key={p.id} className="card" onClick={() => navigate("/select-product", { state: { product: p } })}>
            <div className="row-between">
              <div>
                <strong style={{ fontSize: 17 }}>{p.name}</strong>
                <p className="muted" style={{ margin: "4px 0 0" }}>{formatIQD(p.price)}</p>
              </div>
              <button className="btn-accent" style={{ width: "auto", padding: "10px 18px" }}>اطلب</button>
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
