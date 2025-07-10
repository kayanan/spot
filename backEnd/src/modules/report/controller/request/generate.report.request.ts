export enum ReportType {
  REVENUE_BY_REGION = 'REVENUE_BY_REGION',
  RESERVATIONS_REVENUE_BY_CITY = 'RESERVATIONS_REVENUE_BY_CITY',
  REVENUE_BY_PARKING_OWNERS = 'REVENUE_BY_PARKING_OWNERS',
  SUBSCRIPTION_PAYMENTS_REPORT = 'SUBSCRIPTION_PAYMENTS_REPORT',
  PARKING_OWNER_DETAILED_REPORT = 'PARKING_OWNER_DETAILED_REPORT',
  RESERVATION_REPORT = 'RESERVATION_REPORT',
  PAYMENT_REPORT = 'PAYMENT_REPORT',
  PARKING_AREA_REPORT = 'PARKING_AREA_REPORT',
  USER_REPORT = 'USER_REPORT',
  OCCUPANCY_REPORT = 'OCCUPANCY_REPORT'
}

export interface GenerateReportRequest {
  reportType: ReportType;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  provinceId?: string; // Optional filter by province
  parkingAreaId?: string; // Optional filter by parking area
  userId?: string; // Optional filter by user
  format?: 'JSON' | 'CSV' | 'PDF';
} 