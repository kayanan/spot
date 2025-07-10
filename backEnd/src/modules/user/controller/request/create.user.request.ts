import { ObjectId } from 'mongoose';
import { CardDetail, Address, AccountDetail } from '../../data/dtos/user.dto';

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
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  nic?:string;
  address?: Address;
  isActive?: boolean;
  isDeleted?: boolean;
  vehicle?:Array<string>;
  phoneNumber?: string;
  profileImage?: string;
  bankDetails?: Array<CardDetail>;
  accountDetails?: Array<AccountDetail>;
  cardDetails?: Array<CardDetail>;
}

export interface AdminUpdateUserRequest extends UserRequest {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  nic?:string;
  phoneNumber?:string;
  role?: Array<ObjectId | string>;
  isActive?: boolean;
  vehicle?:Array<{number:string,isDefault:boolean}>;
  approvalStatus?: boolean;
  address?: Address;
  profileImage?: string;
  bankDetails?: Array<CardDetail>;
  accountDetails?: Array<AccountDetail>;
  isDeleted?: boolean;
  cardDetails?: Array<CardDetail>;
}
