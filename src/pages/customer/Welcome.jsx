import React from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="screen center" style={{ paddingTop: 90 }}>
      <span style={{ fontSize: 70 }}>🔥</span>
      <h1 className="display" style={{ fontSize: 28, marginTop: 10 }}>توصيل الغاز</h1>
      <p className="muted" style={{ fontSize: 16 }}>اطلب قنينة الغاز وتصلك حتى باب البيت<br/>قضاء الميمونة</p>
      <div className="mt-24">
        <button className="btn-primary" onClick={() => navigate("/login")}>ابدأ الآن</button>
      </div>
    </div>
  );
}
