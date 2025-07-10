export interface CreateUpdateCityRequest {
  id?: String;
  name: string;
  isActive: boolean;
  districId:string;
  description: string;
  isDeleted?: boolean;
}

export interface CityListRequest {
  districtId?:string;
  search?: string;
  skip?: number;
  limit?: number;
}