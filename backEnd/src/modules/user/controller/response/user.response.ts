import { BaseResponse } from '../../../base/controller/responses/base.repsonse';
import { UserModel } from '../../data/dtos/user.dto';

export interface UserListResponse extends BaseResponse {
  total?: number;
  users: Array<UserModel>;
}

export interface UserProfileResponse extends BaseResponse {
  user: UserModel;
}
