import React from "react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/admin", icon: "📦", label: "الطلبات" },
  { to: "/admin/drivers", icon: "🚚", label: "السائقون" },
  { to: "/admin/customers", icon: "👥", label: "العملاء" },
  { to: "/admin/products", icon: "🛢️", label: "المنتجات" },
  { to: "/admin/reports", icon: "📊", label: "تقارير" },
];

export default function AdminNav() {
  return (
    <nav className="bottom-nav" style={{ maxWidth: 480 }}>
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} end className={({isActive}) => isActive ? "active" : ""}>
          <span className="nav-icon">{it.icon}</span>{it.label}
        </NavLink>
      ))}
    </nav>
  );
}
