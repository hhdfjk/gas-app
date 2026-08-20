import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config.js";
import AdminNav from "./AdminNav.jsx";
import { formatIQD } from "../../utils/orderStatus.js";

function isSameDay(d1, d2) { return d1.toDateString() === d2.toDateString(); }
function isSameMonth(d1, d2) { return d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear(); }

export default function AdminReports() {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) => setOrders(snap.docs.map((d) => d.data())));
    const unsub2 = onSnapshot(collection(db, "drivers"), (snap) => setDrivers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => { unsub(); unsub2(); };
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const withDate = orders.filter((o) => o.createdAt?.toDate).map((o) => ({ ...o, date: o.createdAt.toDate() }));
    const daily = withDate.filter((o) => isSameDay(o.date, now));
    const monthly = withDate.filter((o) => isSameMonth(o.date, now));
    const delivered = orders.filter((o) => o.status === "delivered");
    const cancelled = orders.filter((o) => o.status === "cancelled");
    const totalSales = delivered.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const totalCylinders = delivered.reduce((sum, o) => sum + (o.quantity || 0), 0);

    const perDriver = {};
    delivered.forEach((o) => {
      if (!o.driverId) return;
      if (!perDriver[o.driverId]) perDriver[o.driverId] = { count: 0, total: 0 };
      perDriver[o.driverId].count += 1;
      perDriver[o.driverId].total += o.totalPrice || 0;
    });

    return { dailyCount: daily.length, monthlyCount: monthly.length, totalSales, totalCylinders, deliveredCount: delivered.length, cancelledCount: cancelled.length, perDriver };
  }, [orders]);

  return (
    <div className="screen">
      <h2 className="display mt-8">التقارير</h2>
      <div className="stack">
        <div className="card row-between"><span>طلبات اليوم</span><strong>{stats.dailyCount}</strong></div>
        <div className="card row-between"><span>طلبات هذا الشهر</span><strong>{stats.monthlyCount}</strong></div>
        <div className="card row-between"><span>إجمالي المبيعات (المكتملة)</span><strong>{formatIQD(stats.totalSales)}</strong></div>
        <div className="card row-between"><span>عدد القناني المباعة</span><strong>{stats.totalCylinders}</strong></div>
        <div className="card row-between"><span>الطلبات المكتملة</span><strong>{stats.deliveredCount}</strong></div>
        <div className="card row-between"><span>الطلبات الملغاة</span><strong>{stats.cancelledCount}</strong></div>
      </div>

      <h3 className="display mt-24">مبيعات كل سائق</h3>
      <div className="stack">
        {drivers.map((d) => (
          <div key={d.id} className="card row-between">
            <span>{d.name}</span>
            <strong>{stats.perDriver[d.id]?.count || 0} طلب — {formatIQD(stats.perDriver[d.id]?.total || 0)}</strong>
          </div>
        ))}
      </div>
      <AdminNav />
    </div>
  );
}
