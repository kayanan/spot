import { RoleTypeEnum } from '@/modules/user/enums/role';

export interface CreateUpdateRoleRequest {
  name: string;
  type: string;
  description?: string;
}
