import {
  BaseResponse,
  CountResponse,
} from '../../../base/controller/responses/base.repsonse';
import { ProvinceModel } from '../../data/dtos/province.dto';

export interface ProvinceListResponse extends CountResponse {
  provinces: Array<ProvinceModel>;
}

export interface ProvinceResponse extends BaseResponse {
  province: ProvinceModel;
}
