import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// عميل
import Welcome from "./pages/customer/Welcome.jsx";
import Login from "./pages/customer/Login.jsx";
import VerifyOtp from "./pages/customer/VerifyOtp.jsx";
import CompleteProfile from "./pages/customer/CompleteProfile.jsx";
import Home from "./pages/customer/Home.jsx";
import SelectProduct from "./pages/customer/SelectProduct.jsx";
import OrderReview from "./pages/customer/OrderReview.jsx";
import OrderTracking from "./pages/customer/OrderTracking.jsx";
import MyOrders from "./pages/customer/MyOrders.jsx";
import Addresses from "./pages/customer/Addresses.jsx";
import AddAddress from "./pages/customer/AddAddress.jsx";
import Account from "./pages/customer/Account.jsx";
import Chat from "./pages/customer/Chat.jsx";

// سائق
import DriverLogin from "./pages/driver/DriverLogin.jsx";
import DriverOrders from "./pages/driver/DriverOrders.jsx";
import DriverOrderDetail from "./pages/driver/DriverOrderDetail.jsx";

// إدارة
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail.jsx";
import AdminDrivers from "./pages/admin/AdminDrivers.jsx";
import AdminCustomers from "./pages/admin/AdminCustomers.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";

export default function App() {
  return (
    <Routes>
      {/* عميل */}
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="/" element={<ProtectedRoute allow={["customer"]}><Home /></ProtectedRoute>} />
      <Route path="/select-product" element={<ProtectedRoute allow={["customer"]}><SelectProduct /></ProtectedRoute>} />
      <Route path="/order-review" element={<ProtectedRoute allow={["customer"]}><OrderReview /></ProtectedRoute>} />
      <Route path="/track/:orderId" element={<ProtectedRoute allow={["customer"]}><OrderTracking /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute allow={["customer"]}><MyOrders /></ProtectedRoute>} />
      <Route path="/addresses" element={<ProtectedRoute allow={["customer"]}><Addresses /></ProtectedRoute>} />
      <Route path="/add-address" element={<ProtectedRoute allow={["customer"]}><AddAddress /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute allow={["customer"]}><Account /></ProtectedRoute>} />
      <Route path="/chat/:orderId" element={<ProtectedRoute allow={["customer","driver"]}><Chat /></ProtectedRoute>} />

      {/* سائق */}
      <Route path="/driver/login" element={<DriverLogin />} />
      <Route path="/driver" element={<ProtectedRoute allow={["driver"]}><DriverOrders /></ProtectedRoute>} />
      <Route path="/driver/order/:orderId" element={<ProtectedRoute allow={["driver"]}><DriverOrderDetail /></ProtectedRoute>} />

      {/* إدارة */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute allow={["admin"]}><AdminOrders /></ProtectedRoute>} />
      <Route path="/admin/order/:orderId" element={<ProtectedRoute allow={["admin"]}><AdminOrderDetail /></ProtectedRoute>} />
      <Route path="/admin/drivers" element={<ProtectedRoute allow={["admin"]}><AdminDrivers /></ProtectedRoute>} />
      <Route path="/admin/customers" element={<ProtectedRoute allow={["admin"]}><AdminCustomers /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute allow={["admin"]}><AdminProducts /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allow={["admin"]}><AdminReports /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
}
