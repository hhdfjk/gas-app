import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config.js";
import AdminNav from "./AdminNav.jsx";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => setOrders(snap.docs.map((d) => d.data())));
    return unsub;
  }, []);

  const stats = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      if (!map[o.customerId]) map[o.customerId] = { count: 0, total: 0 };
      map[o.customerId].count += 1;
      map[o.customerId].total += o.totalPrice || 0;
    });
    return map;
  }, [orders]);

  const filtered = customers.filter((c) =>
    !search || c.name?.includes(search) || c.phone?.includes(search)
  );

  return (
    <div className="screen">
      <h2 className="display mt-8">إدارة العملاء</h2>
      <input placeholder="بحث بالاسم أو رقم الهاتف" value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="stack mt-16">
        {filtered.map((c) => (
          <div key={c.id} className="card">
            <div className="row-between">
              <strong>{c.name}</strong>
              <span className="muted" dir="ltr">{c.phone}</span>
            </div>
            <div className="row-between mt-8">
              <span className="muted">عدد الطلبات</span><strong>{stats[c.id]?.count || 0}</strong>
            </div>
            <div className="row-between">
              <span className="muted">إجمالي المشتريات</span><strong>{(stats[c.id]?.total || 0).toLocaleString("en-US")} د.ع</strong>
            </div>
          </div>
        ))}
      </div>
      <AdminNav />
    </div>
  );
}
