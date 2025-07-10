export interface ReservationsRevenueByCityData {
  cityId: string;
  cityName: string;
  districtId: string;
  districtName: string;
  provinceId: string;
  provinceName: string;
  totalReservations: number;
  totalRevenue: number;
  averageRevenuePerReservation: number;
}

export interface ReservationsRevenueByCityResponse {
  status: boolean;
  message: string;
  data: ReservationsRevenueByCityData[];
  summary: {
    totalReservations: number;
    totalRevenue: number;
    averageRevenuePerReservation: number;
  };
  generatedAt: Date;
} 