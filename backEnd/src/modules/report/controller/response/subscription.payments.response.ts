export interface SubscriptionPaymentData {
  paymentId: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerContact: string;
  parkingAreaId: string;
  parkingAreaName: string;
  amount: number;
  status: string;
  paymentMethod: string;
  paymentDate: Date;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  subscriptionPeriod: string; // e.g., "3 months", "1 year"
  paymentReference: string;
  paymentGateway: string;
}

export interface SubscriptionPaymentsResponse {
  status: boolean;
  message: string;
  data: SubscriptionPaymentData[];
  summary: {
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
    averageAmount: number;
  };
  generatedAt: Date;
} 