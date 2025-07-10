import {
  BaseResponse,
  CountResponse,
} from '../../../base/controller/responses/base.repsonse';
import { DistrictModel } from '@/modules/location/data/dtos/district.dto';

export interface DistrictListResponse extends CountResponse {
  total?: number;
  districts: Array<DistrictModel>;
}

export interface DistrictResponse extends BaseResponse {
  district: DistrictModel;
}
