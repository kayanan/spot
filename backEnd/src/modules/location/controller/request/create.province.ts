export interface ProvinceRequest {
  name: string;
  isActive: boolean;
  description: string;
  isDeleted?: boolean;
}

export interface UpdateProvince extends ProvinceRequest {
  id: String;
}
