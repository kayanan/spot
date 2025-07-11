export interface ParkingOwnerProfile {
  ownerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nic: string;
    line1: string;
    line2?: string;
    city: string;
    district: string;
    province: string;
  profileImage?: string;
  isActive: boolean;
  approvalStatus: boolean;
}

export interface ReservationPaymentData {
  paymentId: string;
  reservationId: string;
  paymentAmount: number;
  paymentDate: Date;
  paymentMethod: string;
  referenceNumber: string;
  bankName?: string;
  branch?: string;
  cardNumber?: string;
  paymentStatus: string;
  customerName: string;
  parkingAreaName: string;
  parkingSlot: string;
}

export interface ParkingAreaSummary {
  areaId: string;
  areaName: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  location: string;
  monthlyRevenue: number;
  growth: number;
  totalReviews: number;
  ratingBreakdown: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };
}

export interface ParkingOwnerMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  activeSubscriptions: number;
  totalParkingAreas: number;
  totalSlots: number;
  averageRating: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface PaymentStatusData {
  name: string;
  value: number;
  fill: string;
}

export interface MostBookedArea {
  areaId: string;
  areaName: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  location: string;
  ownerName: string;
}

export interface ParkingOwnerDetailedResponse {
  status: boolean;
  message: string;
  data: {
    profile: ParkingOwnerProfile;
    reservationPayments: ReservationPaymentData[];
    subscriptionPayments: any[]; // Using existing subscription payment structure
    parkingAreas: ParkingAreaSummary[];
    metrics: ParkingOwnerMetrics;
    revenueData: RevenueData[];
    paymentStatusData: PaymentStatusData[];
    mostBookedAreas: MostBookedArea[];
  };
  generatedAt: Date;
} 