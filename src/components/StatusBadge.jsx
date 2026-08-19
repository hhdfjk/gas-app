import React from "react";
import { statusLabel, statusBadgeClass } from "../utils/orderStatus.js";

export default function StatusBadge({ status }) {
  return <span className={`badge ${statusBadgeClass(status)}`}>{statusLabel(status)}</span>;
}
