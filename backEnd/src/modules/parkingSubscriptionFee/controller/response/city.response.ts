import {
  BaseResponse,
  CountResponse,
} from '../../../base/controller/responses/base.repsonse';
import { CityModel } from '@/modules/location/data/dtos/city.dto';

export interface CityListResponse extends CountResponse {
  total?: number;
  cities: Array<CityModel>;
}

export interface CityResponse extends BaseResponse {
  city: CityModel;
}
