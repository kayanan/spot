export interface ParkingOwnerData {
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerContact: string;
  parkingAreas: Array<{
    parkingAreaId: string;
    parkingAreaName: string;
    districtName: string;
    provinceName: string;
    revenue: number;
    bookings: number;
    contactNumber: string;
  }>;
  totalRevenue: number;
  totalBookings: number;
  totalParkingAreas: number;
  averageRevenuePerParkingArea: number;
}

export interface RevenueByParkingOwnersResponse {
  status: boolean;
  message: string;
  data: ParkingOwnerData[];
  summary: {
    totalOwners: number;
    totalRevenue: number;
    totalBookings: number;
    totalParkingAreas: number;
    averageRevenuePerOwner: number;
  };
  generatedAt: Date;
} 