export interface CreateUpdateParkingSubscriptionFeeRequest {
  id?: String;
  name: string;
  isActive: boolean;
  districId:string;
  description: string;
  isDeleted?: boolean;
}

export interface ParkingSubscriptionFeeListRequest {
  cityId?:string;
  search?: string;
  skip?: number;
  limit?: number;
}