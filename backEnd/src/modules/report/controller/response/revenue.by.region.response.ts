export interface RevenueByRegionData {
  provinceId: string;
  provinceName: string;
  totalRevenue: number;
  totalBookings: number;
  totalParkingAreas: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  growthPercentage: number;
  averageRevenuePerBooking: number;
  averageRevenuePerParkingArea: number;
}

export interface RevenueByRegionResponse {
  status: boolean;
  message: string;
  data: RevenueByRegionData[];
  summary: {
    totalRevenue: number;
    totalBookings: number;
    totalParkingAreas: number;
    averageGrowthPercentage: number;
  };
  generatedAt: Date;
} 