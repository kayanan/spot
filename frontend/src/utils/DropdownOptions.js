/**
 * src/utils/DropdownOptions.js
 *
 * Central place to store commonly used dropdown options (status, color, payment types, etc.).
 */

// Status Options
export const statusOptions = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" },
];

// Payment Type Options
export const paymentTypeOptions=[
  { value: "credit", label: "CREDIT" },
  { value: "cash", label: "CASH" },
  { value: "bank transfer", label: "BANK TRANSFER" },
  { value: "cheque", label: "CHEQUE" },
];

// Designation Options
export const designationOptions = [
  { value: "", label: "All" },
  { value: "ADMIN", label: "ADMIN" },
  { value: "PARKING_OWNER", label: "PARKING OWNER" },
  { value: "PARKING_MANAGER", label: "PARKING MANAGER" },
  { value: "CUSTOMER", label: "CUSTOMER" },
];

// Approval Status Options
export const approvalStatusOptions = [
  { value: "true", label: "Approved" },
  { value: "false", label: "Pending" },
];

// Status Options
export const isActiveOptions = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

