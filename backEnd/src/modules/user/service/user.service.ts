import UserRepository from '../data/repository/user.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserDTO, UserModel } from '../data/dtos/user.dto';
import { sendSMS } from '../../base/services/sms.service';
import * as EmailService from '../../base/services/email.service';
import { EmailTemplateType } from '../../base/enums/email.template.type';
import { ChangePasswordRequest, ChangePasswordLoggedInRequest } from '../controller/request/change.password.request';
import UserValidator from '../validators/user.validator';
import {
  BaseResponse,
  CreatedUpdatedResponse,
} from '../../base/controller/responses/base.repsonse';
import { ForgotPasswordRequest } from '../controller/request/forgot.password.request';
import {
  UserListResponse,
  UserProfileResponse,
} from '../controller/response/user.response';
import { LoginResponse } from '../controller/response/auth.response';
import { UserJWT } from '../data/dtos/user.jwt.dto';

import {
  CreateUserRequest,
  UpdateUserRequest,
  AdminUpdateUserRequest,
} from '../controller/request/create.user.request';
import { UserListRequest } from '../controller/request/user.list.request';
import { isValidObjectId } from 'mongoose';
//import AssetService from '../../asset/service/asset.service';
import BaseRepository from '@/modules/base/data/repository/base.repository';
import { RoleDTO } from '@/modules/user/data/dtos/role.dto';
import { json } from 'express';
import HelperUtil from '../../../utils/helper.util';
import { deleteParkingAreaByOwnerId, updateParkingAreaByOwnerId } from '../../parkingArea/service/parkingArea.service';
import RoleService from './role.service';
import { log } from 'console';

const getUsers = async (
  listReq: UserListRequest
): Promise<UserListResponse> => {
  const list: UserListResponse =
    await UserRepository.findUsers(listReq);

  return {
    status: true,
    totalCount: list.total,
    users: list.users,
  } as UserListResponse;
};

const getUser = async (id: string): Promise<UserProfileResponse> => {
  const user: UserModel | null = await UserRepository.findById(
    id
  );

  if (user === null) {
    throw new Error('User not found');
  }
  user;
  return { status: true, user } as UserProfileResponse;
};

const saveUser = async (
  createUserRequest: Partial<CreateUserRequest>
): Promise<CreatedUpdatedResponse> => {
  const addedBy = createUserRequest?.addedBy;
  delete createUserRequest.addedBy;
  const valResult =
    UserValidator.saveUserValidator(createUserRequest);

  if (valResult.error) throw new Error(valResult.error.message);
  let data=valResult.data as CreateUserRequest
  if(addedBy!=="MANAGER"){
    const checkUser = await UserRepository.findByEmail(
      createUserRequest.email!
    );
    if (checkUser !== null) throw new Error('User already exists');
  }
  const role = await RoleService.getRoles({search:"CUSTOMER"});
  const roleIds = role.roles.map(item => item._id as string);
  if(data.role?.includes(roleIds[0] as unknown as string)){
    data.isActive=true
  }
  const id: string | null =
    await UserRepository.saveUser(data as unknown as Partial<CreateUserRequest>);
  if (id != null) {
    return { status: true, id } as CreatedUpdatedResponse;
  }

  throw new Error('User not inserted');
};

const login = async (req: any) => {
  const valResult = UserValidator.loginValidator({
    email: req.body.email,
    password: req.body.password,
  });
  if (valResult.error) throw new Error(valResult.error.message);

  const checkUser = await UserRepository.findByEmail(req.body.email);
  if (checkUser == null) throw new Error('User not found');

  const compareRes: boolean = await bcrypt.compare(
    req.body.password,
    checkUser.password
  );
  const role = await BaseRepository.findAll(
    RoleDTO,
    {
      _id: {
        $in: checkUser.role
      }
    }, 0, 100,
  )
  if (role.items.length === 0) throw new Error('Role not found');
  console.log(checkUser);
  if (compareRes) {
    const token = jwt.sign(
      {
        firstName: checkUser.firstName,
        lastName: checkUser.lastName,
        email: checkUser.email,
        userId: checkUser._id,
        roles: role.items.map(item => item.type),
        mobileNumber: checkUser.phoneNumber,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '6h',
      }
    );
    return {
      status: true,
      firstName: checkUser.firstName,
      lastName: checkUser.lastName,
      email: checkUser.email,
      userId: checkUser._id!.toString(),
      roles: role.items.map(item => item.type),
      mobileNumber: checkUser.phoneNumber,
      accessToken: token,
    } as LoginResponse;
  }
  throw new Error('Invalid credentials');
};

const forgotPassword = async (
  forgotPasswordRequest: ForgotPasswordRequest
): Promise<BaseResponse> => {
console.log("dadadsdad");

  if (forgotPasswordRequest.email == null)
    throw new Error('Email not found');
  const user = await UserRepository.findByEmail(
    forgotPasswordRequest.email
  );
  if (user === null) throw new Error('User not found');
  const otp = await UserRepository.setPasswordResetOtp(
    user._id!.toString()
  );
  console.log("dadadsdad");
  // Send email with OTP
  let emailSent = false;
  try {
    emailSent = await EmailService.send(
      user?.email ?? '',
      EmailTemplateType.forgotPassword,
      {
        expiresIn: process.env.OTP_EXPIRES_MINUTE,
        otp,
        name: user.firstName,
      }
    );
    console.log('Email sent successfully:', emailSent);
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    emailSent = false;
  }
  
  // Send SMS as backup
  let smsSent = false;
  try {
    const message = `Your OTP is ${otp}. Use this code to reset your password. It will expire in ${process.env?.OTP_EXPIRES_MINUTE} minutes. - FindMySpot`;
    // const smsResult = await sendSMS(user?.phoneNumber?.replace(/^0/, '94')!, message);
    // smsSent = smsResult.status === true;
    console.log('SMS sent successfully:', smsSent);
  } catch (smsError) {
    console.error('SMS sending failed:', smsError);
    smsSent = false;
  }
  
  if (!emailSent) throw new Error('Failed to send OTP via email and SMS. Please try again later.');

  return {
    status: true,
    message: 'OTP sent successfully',
  } as BaseResponse;
};

const resetPassword = async (
  changePasswordRequest: ChangePasswordRequest
): Promise<BaseResponse> => {
  const valResult = UserValidator.resetPasswordValidator({
    email: changePasswordRequest.email,
    password: changePasswordRequest.password,
    otp: changePasswordRequest.otp,
  });
  if (valResult.error) throw new Error(valResult.error.message);

  const user = await UserRepository.findByEmail(
    changePasswordRequest.email
  );
  if (user === null) throw new Error('User not found');

  const diff =
    new Date().getTime() -
    (user?.otpExpiresAt ?? new Date()).getTime();
  if (diff > 0) {
    throw new Error('OTP Expired');
  }
  const passwordChanged = await UserRepository.changePassword(
    user._id!.toString(),
    changePasswordRequest.email,
    changePasswordRequest.password
  );
  if (!passwordChanged)
    throw new Error('Error while updating the password');
  
  // Send confirmation email
  const emailSent = await EmailService.send(
    user.email ?? '',
    EmailTemplateType.changePassword,
    {
      name: user.firstName,
    }
  );
  
  const resetOTP = await UserRepository.resetPasswordResetOtp(
    user._id!.toString()
  );
  if (!resetOTP) throw new Error('OTP not reset');
  return {
    status: true,
    message: 'Password reset success',
  } as BaseResponse;
};

const updateUser = async (
  updateUserRequest: UpdateUserRequest,
  userData: UserJWT
): Promise<CreatedUpdatedResponse> => {
  const valResult =
    UserValidator.updateUserValidator(updateUserRequest);
  if (valResult.error) throw new Error(valResult.error.message);
  const id: string | null = await UserRepository.updateUser(
    updateUserRequest,
    userData.userId
  );
  if (id != null) {
    return { status: true, id } as CreatedUpdatedResponse;
  }
  throw new Error('User not Updated');
};

const getUserByMobileNumber = async (mobileNumber: string): Promise<UserModel | null> => {
  const user: UserModel | null = await UserRepository.findByMobileNumber(mobileNumber);
  return user;
};  

const adminUpdateUser = async (
  adminUpdateUserRequest: AdminUpdateUserRequest,
  id: string
): Promise<CreatedUpdatedResponse> => {

  const valResult = UserValidator.adminUpdateUserValidator(
    adminUpdateUserRequest
  );
  if (valResult.error) throw new Error(valResult.error.message);

  const updatedId: string | null = await UserRepository.adminUpdateUser(
    adminUpdateUserRequest,
    id
  );
  if (updatedId != null) {
    if ((adminUpdateUserRequest.isActive?.toString() ?? "true") === "false") {
      await updateParkingAreaByOwnerId(id, { isActive: false });
    }

    return { status: true, id: updatedId } as CreatedUpdatedResponse;
  }
  throw new Error('User not Updated');
};

const sendOTPForMobilNumberVerification = async (phoneNumber: string): Promise<BaseResponse> => {
  const otp = HelperUtil.generateOtp();
  const message = `Your OTP is ${otp}. Use this code to verify your mobile number. It will expire in ${process.env?.OTP_EXPIRES_MINUTE} minutes. - FindMySpot`;
  const smsSent = await sendSMS(phoneNumber, message);
  if (!smsSent) throw new Error('SMS not sent');
  return {
    status: true,
    message: otp.toString(),
  } as BaseResponse;
};


const approveParkingOwner = async (id: string): Promise<BaseResponse> => {
  const user = await UserRepository.findById(id);
  if (!user) throw new Error('User not found');
  user.approvalStatus = true;
  user.isActive = true;
  await user.save();
  await updateParkingAreaByOwnerId(user._id as string, { isActive: true });

  const message = `Your parking owner request has been approved. Please login to your account to manage your parking areas. using your email and password. - FindMySpot`;
  const mobileNumber = user.phoneNumber?.replace(/^0/, '94');
  if (!mobileNumber) throw new Error('Mobile number not found');
  await sendSMS(mobileNumber, message);
  return { status: true, message: 'Parking owner approved successfully' } as BaseResponse;
};

const rejectParkingOwner = async (id: string, reason: string): Promise<BaseResponse> => {
  const user = await UserRepository.findById(id);
  if (!user) throw new Error('User not found');

  const message = `Your parking owner request has been rejected. Reason: ${reason}. - FindMySpot`;
  const mobileNumber = user.phoneNumber?.replace(/^0/, '94');
  if (!mobileNumber) throw new Error('Mobile number not found');
  await UserRepository.hardDeleteById(id);
  await deleteParkingAreaByOwnerId(user._id as string);
  let responseMessage = "Parking owner rejected successfully"

  try {
    await sendSMS(mobileNumber, message);

  }
  catch (error) {
    responseMessage = "Parking owner rejected successfully but SMS not sent"
  }

  return { status: true, message: responseMessage } as BaseResponse;
};

const getPendingOwnersCount = async (): Promise<BaseResponse> => {
  const role = await RoleService.getRoles({search:"PARKING_OWNER"});
  const roleIds = role.roles.map(item => item._id as string);
  const count = await UserRepository.findPendingOwnersCount(roleIds);

  return { status: true, count: count } as BaseResponse;
};

const checkDuplicateEntry = async (data: Partial<UserModel>): Promise<BaseResponse> => {
  const query: any = {};
  const queryArray: any[] = [];
  if (data.email) {
    queryArray.push({ email: data.email });
  }
  if (data.phoneNumber) {
    queryArray.push({ phoneNumber: data.phoneNumber });
  }
  if (data.nic) {
    queryArray.push({ nic: data.nic });
  }

  if (queryArray.length > 0) {
    query.$or = queryArray;
  }
  const result = await UserDTO.find(query);
  if (result.length > 0) {
    const errorResponse: any = {};

    for (const item of result) {
      if (item.email && data.email && item.email?.toLowerCase() === data.email?.toLowerCase()) {
        errorResponse.email = "Email already exists";
      }
      if (item.phoneNumber && item.phoneNumber === data.phoneNumber) {
        errorResponse.phoneNumber = "Phone number already exists";
      }
      if (item.nic.toLowerCase() === data.nic?.toLowerCase()) {
        errorResponse.nic = "NIC already exists";
      }
    }

    return { status: false, message: 'User already exists' ,errorResponse} as BaseResponse;
  }
  return { status: true, message: 'User not found' } as BaseResponse;
};

const deleteUser = async (id: string): Promise<BaseResponse> => {
  const user = await UserRepository.softDeleteById(id);
  if (!user) {
    throw new Error('User not found');
  }
  return { status: true, message: 'User deleted successfully' } as BaseResponse;
};

const changePasswordLoggedIn = async (
  changePasswordRequest: ChangePasswordLoggedInRequest,
  userJWT: UserJWT
): Promise<BaseResponse> => {
  try {
    // Validate the request
    const valResult = UserValidator.changePasswordValidator({
      currentPassword: changePasswordRequest.currentPassword,
      newPassword: changePasswordRequest.newPassword,
    });
    
    if (valResult.error) {
      throw new Error(valResult.error.errors[0].message);
    }
    // Get the current user with password included
    const user = await UserRepository.findByEmail(userJWT.email);
    if (!user) throw new Error('User not found');
    console.log(user);
    
    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordRequest.currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) throw new Error('Current password is incorrect');

    // Update the password (pass plain password, let pre-save hook handle hashing)
    const passwordChanged = await UserRepository.updatePassword(
      userJWT.userId,
      changePasswordRequest.newPassword
    );
    if (!passwordChanged) throw new Error('Failed to update password');

    return {
      status: true,
      message: 'Password changed successfully',
    } as BaseResponse;
  } catch (error: any) {
    throw new Error(`Failed to change password: ${error.message}`);
  }
};

export default {
  getUsers,
  getUser,
  saveUser,
  login,
  forgotPassword,
  resetPassword,
  changePasswordLoggedIn,
  updateUser,
  adminUpdateUser,
  sendOTPForMobilNumberVerification,
  approveParkingOwner,
  rejectParkingOwner,
  getPendingOwnersCount,
  checkDuplicateEntry,
  getUserByMobileNumber,
  deleteUser
};


