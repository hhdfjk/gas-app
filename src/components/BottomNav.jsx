import React from "react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/", icon: "🔥", label: "الرئيسية" },
  { to: "/orders", icon: "📦", label: "طلباتي" },
  { to: "/addresses", icon: "📍", label: "العناوين" },
  { to: "/account", icon: "👤", label: "حسابي" },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.to === "/"} className={({isActive}) => isActive ? "active" : ""}>
          <span className="nav-icon">{it.icon}</span>{it.label}
        </NavLink>
      ))}
    </nav>
  );
}
