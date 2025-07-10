import { JwtPayload } from 'jsonwebtoken';
import { RoleTypeEnum } from '@/modules/user/enums/role';

export interface UserJWT extends JwtPayload {
  firstName: string;
  lastName: string;
  email: string;
  role: Array<RoleTypeEnum>;
  userId: string;
}
