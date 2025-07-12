import { ObjectId } from 'mongoose';
import { AccountDetail } from '../../data/dtos/user.dto';

export interface UserRequest {
  firstName?: string;
  lastName?: string;
}

export interface CreateUserRequest extends UserRequest {
  email?: string;
  password?: string;
  nic?:string;
  phoneNumber?:string;
  role?: Array<ObjectId | string>;
  addedBy?:string;
  isActive?:boolean;
}

export interface UpdateUserRequest extends UserRequest {
  addRole?: string;
  removeRole?: string;
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  nic?:string;
  line1:string;
  line2:string;
  district: string;
  province: string;
  zipCode: string;
  isActive?: boolean;
  isDeleted?: boolean;
  vehicle?:Array<string>;
  phoneNumber?: string;
  profileImage?: string;
  accountDetails?: Array<AccountDetail>;
  
}

export interface AdminUpdateUserRequest extends UserRequest {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  nic?:string;
  phoneNumber?:string;
  line1:string;
  line2:string;
  district: string;
  province: string;
  zipCode: string;
  role?: Array<ObjectId | string>;
  isActive?: boolean;
  vehicle?:Array<{number:string,isDefault:boolean}>;
  approvalStatus?: boolean;
  profileImage?: string;
  accountDetails?: Array<AccountDetail>;
  isDeleted?: boolean;
}
