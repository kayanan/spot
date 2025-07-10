import { ListRequest } from '../../../base/controller/request/list.request';

export interface UserListRequest extends ListRequest {
  isActive?: string;
  approvalStatus?: string;
  role?: string;
  search?: string;
  isDeleted?: string;
}
