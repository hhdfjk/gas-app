import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function ProtectedRoute({ allow, children }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="screen center"><span className="spinner" style={{borderTopColor:"#1E5F74", borderColor:"rgba(30,95,116,.25)"}}/></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role === "new_customer" && allow.includes("customer")) return <Navigate to="/complete-profile" replace />;
  if (!allow.includes(role)) return <Navigate to="/" replace />;
  return children;
}
