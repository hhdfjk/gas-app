import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import BottomNav from "../../components/BottomNav.jsx";

export default function Account() {
  const { user, profile, signOutUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOutUser();
    navigate("/login", { replace: true });
  }

  return (
    <div className="screen">
      <h2 className="display mt-8">حسابي</h2>
      <div className="card center">
        <div style={{ width: 70, height: 70, borderRadius: "50%", background: "var(--color-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto" }}>
          {profile?.name?.charAt(0) || "ع"}
        </div>
        <h3 style={{ margin: "10px 0 2px" }}>{profile?.name}</h3>
        <p className="muted" dir="ltr">{user?.phoneNumber}</p>
      </div>
      <div className="card stack">
        <div className="row-between" onClick={() => navigate("/addresses")}><span>📍 عناويني</span><span>‹</span></div>
        <div className="row-between" onClick={() => navigate("/orders")}><span>📦 طلباتي</span><span>‹</span></div>
      </div>
      <button className="btn-danger mt-16" onClick={handleLogout}>تسجيل الخروج</button>
      <BottomNav />
    </div>
  );
}
