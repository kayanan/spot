import mongoose from 'mongoose';
import HelperUtil from '../../../../utils/helper.util';
import { UserDTO, UserModel } from '../dtos/user.dto';
import { UserListRequest } from '../../controller/request/user.list.request';
import { UserListResponse } from '../../controller/response/user.response';
import {
  AdminUpdateUserRequest,
  CreateUserRequest,
  UpdateUserRequest,
} from '../../controller/request/create.user.request';

async function findUsers(
  listReq: UserListRequest
): Promise<UserListResponse> {
  const query = { isDeleted: false } as any;
  if (listReq.search) {
    query.$or = [
      {
        firstName: {
          $regex: '.*' + listReq.search ? listReq.search : '.*',
          $options: 'i',
        },
      },
      {
        lastName: {
          $regex: '.*' + listReq.search ? listReq.search : '.*',
          $options: 'i',
        },
      },
      {
        email: {
          $regex: '.*' + listReq.search ? listReq.search : '.*',
          $options: 'i',
        },
      },
    ];
  }
  
  if (listReq.approvalStatus != null) {
    query.approvalStatus = listReq.approvalStatus === 'true';
  }
  if (listReq.isActive != null) {
    query.isActive = listReq.isActive === 'true';
  }
  if (listReq.role) {
    if(listReq.role === "PARKING_OWNER"){
      query["role.type"]=listReq.role
    }
    else if(listReq.role === "CUSTOMER"){
      query["role.type"]=listReq.role
    }
  }
  if (listReq.isDeleted != null) {
    query.isDeleted = listReq.isDeleted === 'true';
  }
  const total = await findTotalUsers(query);


  const users = await UserDTO.aggregate([
    
   
    {
      $lookup: {
        from: 'roles',
        localField: 'role',
        foreignField: '_id',
        as: 'role'
      }
    },
     {$unwind: '$role'},
    

    {
      $match:query
    },
    {
      $project: {
    
        password: 0,
        otp: 0,
        otpExpiresAt: 0,
        isDeleted: 0,
        __v: 0,}
      },
      {$skip:HelperUtil.pageSkip(
        listReq.skip ?? 0,
        listReq.limit ?? Number(process.env.PAGINATION_LIMIT)
      )},
      {$limit:listReq.limit ?? Number(process.env.PAGINATION_LIMIT)},
    
  ]);
  return { total, users };
}

async function saveUser(
  userPayload: Partial<CreateUserRequest >
): Promise<string | null> {
  const newUser = new UserDTO(userPayload);
  const { _id} = await newUser.save();
  return _id as string;
}

async function findById(id: string): Promise<UserModel | null> {
  const user: UserModel | null = await UserDTO.findById(new mongoose.Types.ObjectId(id))
    .populate('role', '_id city district province')
    .select('-password -__v -createdAt -updatedAt -isDeleted -otp -otpExpiresAt ');
  return user as UserModel;
}

async function findByMobileNumber(mobileNumber: string): Promise<UserModel | null> {
  const user: UserModel | null = await UserDTO.findOne({
    phoneNumber:mobileNumber,
    isDeleted: {$ne: true},
  });
  return user as UserModel;
}

async function findByEmail(email: string): Promise<UserModel | null> {
  //make sure to delete the password attribute before return to the api calls.
  return UserDTO.findOne({
    email,
    isDeleted: {$ne: true},
  });
}

// send the password reset otp
async function setPasswordResetOtp(userId: string): Promise<string> {
  const otp = HelperUtil.generateOtp();
  const updated = await UserDTO.updateOne(
    {
      _id: userId,
    },
    {
      otp: `${otp}`,
      otpExpiresAt: HelperUtil.addMinute(
        Number(process.env.OTP_EXPIRES_MINUTE)
      ),
    }
  );
  if (updated.acknowledged && updated.modifiedCount > 0) {
    return `${otp}`;
  } else {
    throw new Error(`Failed to generate the otp.`);
  }
}

async function findTotalUsers(query: any): Promise<number> {
  return UserDTO.countDocuments(query);
}

// reset the otp once the password is changed
async function resetPasswordResetOtp(
  userId: string
): Promise<boolean> {
  const updated = await UserDTO.updateOne(
    {
      _id: userId,
    },
    {
      otp: null,
      otpExpiresAt: null,
    }
  );
  if (updated.acknowledged && updated.modifiedCount > 0) {
    return true;
  } else {
    return false;
  }
}

async function changePassword(
  id: string,
  email: string,
  password: string
): Promise<boolean> {
  try {
    //we cannot use `updateOne`, we have to use save() otherwise it's not gonna trigger the `pre` hook.
    //which contains the password hashing code.
    const user = await UserDTO.findOne({
      _id: new mongoose.Types.ObjectId(id),
      email: email,
      isActive: true,
      isDeleted: {$ne: true},
    });
    if (user) {
      user.password = password;
      const result = await user?.save();
      return result != null;
    } else {
      throw Error(`User is not found.`);
    }
  } catch (e) {
    throw e as Error;
  }
}

async function updateUser(
  userPayload: UpdateUserRequest,
  userId: string
): Promise<string | null> {
  const updateUser = (await UserDTO.findOneAndUpdate(
    { _id: userId },
    userPayload,
    {
      new: true,
    }
  )) as unknown as UpdateUserRequest;

  return updateUser.id!;
}

async function adminUpdateUser(
  userPayload: AdminUpdateUserRequest,
  userId: string
): Promise<string | null> {
  const adminUpdateUser = (await UserDTO.findOneAndUpdate(
    { _id: userId },
    userPayload,
    {
      new: true,
    }
  )) as unknown as AdminUpdateUserRequest;
  return adminUpdateUser.id;
}

async function findByRole(role: string): Promise<UserModel | null> {
  const user = await UserDTO.findOne({
    role,
    isDeleted: {$ne: true},
  });
  return user;
}

async function softDeleteById(id: string): Promise<UserModel | null> {
  const user: UserModel | null = await UserDTO.findById(id);
  if (!user) {
    return null;
  }
  user.isDeleted = true;
  await user.save();

  return user;
}
async function hardDeleteById(id: string): Promise<UserModel | null> {
  const user: UserModel | null = await UserDTO.findById(id);
  if (!user) {
    return null;
  }
  await user.deleteOne();
  return user;
}
async function findPendingOwnersCount(role: string[]): Promise<number> {
  return UserDTO.countDocuments({ approvalStatus: {$ne: true},role:{$in:role} });
}

export default {
  findUsers,
  saveUser,
  findById,
  findByEmail,
  setPasswordResetOtp,
  findTotalUsers,
  resetPasswordResetOtp,
  changePassword,
  updateUser,
  adminUpdateUser,
  findByRole,
  softDeleteById,
  hardDeleteById,
  findPendingOwnersCount,
  findByMobileNumber
};
