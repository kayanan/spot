import { BaseResponse } from '../../../base/controller/responses/base.repsonse';

export interface LoginResponse extends BaseResponse {
  firstName: string;
  lastName: string;
  email: string;
  userId: string;
  accessToken: string;
  roles: string[];
}
