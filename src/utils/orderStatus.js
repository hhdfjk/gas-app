export const ORDER_STATUS = {
  pending_acceptance: { label: "بانتظار قبول الطلب", badge: "badge-pending" },
  accepted: { label: "تم قبول الطلب", badge: "badge-progress" },
  preparing: { label: "جاري تجهيز الطلب", badge: "badge-progress" },
  driver_assigned: { label: "تم تعيين سائق", badge: "badge-progress" },
  driver_on_way: { label: "السائق في الطريق", badge: "badge-active" },
  driver_arrived: { label: "وصل السائق", badge: "badge-active" },
  delivered: { label: "تم تسليم الطلب", badge: "badge-success" },
  cancelled: { label: "تم إلغاء الطلب", badge: "badge-danger" },
};

export const STATUS_ORDER = [
  "pending_acceptance", "accepted", "preparing",
  "driver_assigned", "driver_on_way", "driver_arrived", "delivered",
];

export function statusLabel(status) {
  return ORDER_STATUS[status]?.label || status;
}
export function statusBadgeClass(status) {
  return ORDER_STATUS[status]?.badge || "badge-pending";
}
export function formatIQD(n) {
  return `${Number(n || 0).toLocaleString("en-US")} د.ع`;
}
export function generateOrderNumber() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${rand}`;
}
