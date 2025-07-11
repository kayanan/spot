import { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../../../utils/common.util';
import UserService from '../service/user.service';
import { LoginResponse } from './response/auth.response';
import {
  BaseResponse,
  CreatedUpdatedResponse,
} from '../../base/controller/responses/base.repsonse';
import { ChangePasswordRequest, ChangePasswordLoggedInRequest } from './request/change.password.request';
import { ForgotPasswordRequest } from './request/forgot.password.request';
import {
  UserListResponse,
  UserProfileResponse,
} from './response/user.response';
import { UserJWT } from '../data/dtos/user.jwt.dto';
import {
  AdminUpdateUserRequest,
  CreateUserRequest,
  UpdateUserRequest,
} from './request/create.user.request';
import { UserListRequest } from './request/user.list.request';
import { UserModel } from '../data/dtos/user.dto';
import jwt from 'jsonwebtoken';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const response: UserListResponse = await UserService.getUsers(
      req.query as unknown as UserListRequest
    );
    res.status(200).json(response);
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
    console.log(error)
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const response: UserProfileResponse =
      await UserService.getUser(req.params.id);
    res.status(200).json(response);
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const getUserByMobileNumber = async (req: Request, res: Response) => {
  try {
    const response: UserModel | null = await UserService.getUserByMobileNumber(req.params.mobileNumber);
    if(response){
      res.status(200).json(response);
    }
    else{
      console.log("User not found");
      res.status(400).json(errorResponse("User not found"));
    }
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const saveUser = async (req: Request, res: Response) => {
  try {
    const response: CreatedUpdatedResponse =
      await UserService.saveUser(
        req.body as unknown as Partial<CreateUserRequest>
      );
    res.status(201).json(response);
  } catch (error: any) {
     console.log(error.message)
    res.status(400).json(errorResponse(error.message));
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const response: LoginResponse = await UserService.login(req);
    console.log(response.accessToken,"response");
    res.cookie('token', response.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      //secure: true,
      sameSite: 'strict',
      //sameSite: 'lax',
      maxAge: 6 * 60 * 60 * 1000, // 6 hours
    });
    res.status(200).json(response);
  } catch (error: any) {
    console.log(error)
    res.status(400).json(errorResponse(error.message));
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // Clear the token cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    res.status(200).json({
      status: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    res.status(500).json(errorResponse('Logout failed'));
  }
};

export const getCurrentUser = async (req: any, res: Response) => {
  try {
    // The user data is already available from the checkToken middleware
    const userData = req.userData;
    
    if (!userData) {
      res.status(401).json(errorResponse('User not authenticated'));
      return;
    }

    // Get full user details from database
    const user = await UserService.getUser(userData.userId);
    
    res.status(200).json({
      status: true,
      user: user.user,
      userId: userData.userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      roles: userData.roles,
    });
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const sendOTP = async (req: Request, res: Response) => {
  console.log("dasdsadsdsdsd");
  
  try {
    const response: BaseResponse = await UserService.forgotPassword(
      req.body as unknown as ForgotPasswordRequest
    );
    res.status(200).json(response);
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const verifyMobileNumberOTP = async (req: Request, res: Response) => {
  try {
    const response: BaseResponse = await UserService.sendOTPForMobilNumberVerification(
      req.query.phoneNumber as string
    );
    res.status(200).json(response);
  } catch (error: any) {
    console.log(error)
    res.status(400).json(errorResponse(error.message));
  }
};


export const changePassword = async (req: Request, res: Response) => {
  try {
    const response: BaseResponse = await UserService.resetPassword(
      req.body as unknown as ChangePasswordRequest
    );
    res.status(200).json(response);
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const changePasswordLoggedIn = async (req: any, res: Response) => {
  try {
    console.log("hiiiiiiiiiii");
    
    const response: BaseResponse = await UserService.changePasswordLoggedIn(
      req.body as unknown as ChangePasswordLoggedInRequest,
      req.userData as unknown as UserJWT
    );
    res.status(200).json(response);
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const updateUser = async (req: any, res: Response) => {
  try {
    const response: CreatedUpdatedResponse =
      await UserService.updateUser(
        req.body as unknown as UpdateUserRequest,
        req.userData as unknown as UserJWT
      );
    res.status(201).json(response);
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const adminUpdateUser = async (
  req: Request,
  res: Response
) => {
  try {
    try {
      Object.keys(req.body).forEach(key => {
        const value = req.body[key];
  
        // Parse boolean strings
        if (value === 'true') {
          req.body[key] = true;
        } else if (value === 'false') {
          req.body[key] = false;
        }
  
        // Parse arrays or objects (stringified JSON)
        else if (typeof value === 'string' && (value.trim().includes('[') || value.trim().includes('{'))) {
          try {
            const parsed = JSON.parse(value);
            req.body[key] = parsed;
          } catch {
          }
        }
      });
  
     
    } catch (error) {
      console.error("Error parsing form data", error);
      return res.status(400).json({ message: "Invalid form data" });
    }
   
    
    console.log(req.body,"req.body");
    
    const response: CreatedUpdatedResponse =
      await UserService.adminUpdateUser(
        req.body as unknown as AdminUpdateUserRequest,
        req.params.id as string
      );
    res.status(201).json(response);
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
    console.log(error)
  }
};

export const approveParkingOwner = async (req: Request, res: Response) => {
  try {
    const response: BaseResponse = await UserService.approveParkingOwner(req.params.id);
    res.status(200).json(response);
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const rejectParkingOwner = async (req: Request, res: Response) => {
  try {
    const reason = req.body.reason as string;
    const response: BaseResponse = await UserService.rejectParkingOwner(req.params.id, reason);
    res.status(200).json(response);
  } catch (error: any) {
    console.log(error)
    res.status(400).json(errorResponse(error.message));
  }
};

export const getPendingOwnersCount = async (req: Request, res: Response) => {
  try {
    const response: BaseResponse = await UserService.getPendingOwnersCount();
    res.status(200).json(response);
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};
 
export const checkDuplicateEntry = async (req: Request, res: Response) => {
  try {
    const response: BaseResponse = await UserService.checkDuplicateEntry(req.body);
    if(response.status){  
      res.status(200).json(response);
    }
    else{
      res.status(400).json(response);
    }
  } catch (error: any) {
    console.log(error)
    res.status(400).json(errorResponse(error.message));
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const response: BaseResponse = await UserService.deleteUser(req.params.id);
    res.status(200).json(response);
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};