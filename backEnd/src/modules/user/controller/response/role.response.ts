import {
  BaseResponse,
  CountResponse,
} from '../../../base/controller/responses/base.repsonse';
import { RoleModel } from '../../data/dtos/role.dto';

export interface RoleListResponse extends CountResponse {
  roles: Array<RoleModel>;
}

export interface RoleResponse extends BaseResponse {
  role: RoleModel;
}
