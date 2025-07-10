export interface CreateUpdateDistrictRequest {
  id?: String;
  name: string;
  isActive: boolean;
  provinceId:string;
  description: string;
  isDeleted?: boolean;
}

export interface DistrictListRequest {
  provinceId?:string;
  search?: string;
  skip?: number;
  limit?: number;
}