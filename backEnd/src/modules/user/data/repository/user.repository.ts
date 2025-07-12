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
import { RoleDTO } from '../dtos/role.dto';

async function findUsers(
  listReq: UserListRequest
): Promise<UserListResponse> {
  const query = { isDeleted: {$ne: true} } as any;
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
  if(listReq.parkingOwnerId){
    query["parkingAreaID.parkingOwnerId"] = listReq.parkingOwnerId
  }
  if(listReq.parkingAreaId){
    query["parkingAreaID"] = listReq.parkingAreaId
  }
  
  if (listReq.approvalStatus != null) {
    query.approvalStatus = listReq.approvalStatus === 'true';
  }
  if (listReq.isActive != null) {
    query.isActive = listReq.isActive === 'true';
  }
  if (listReq.role) {
   const role = await RoleDTO.findOne({type:listReq.role})
   if(role){
    query.role = {$in:[role._id]}
   }
  }
  if (listReq.isDeleted != null) {
    query.isDeleted = listReq.isDeleted === 'true';
  }
  const total = await findTotalUsers(query);
  console.log(listReq?.page, listReq.limit,"total");
  const users = await UserDTO.find(query).skip(HelperUtil.pageSkip(
    Number(listReq?.page)  ?? 0,
    Number(listReq?.limit) ?? Number(process.env.PAGINATION_LIMIT)
  )).limit(Number(listReq?.limit) ?? Number(process.env.PAGINATION_LIMIT) ?? 10);
  console.log(users,"users");
  // const users = await UserDTO.aggregate([
    
  //   {
  //     $match:query
  //   },
  //   {
  //     $project: {
    
  //       password: 0,
  //       otp: 0,
  //       otpExpiresAt: 0,
  //       isDeleted: 0,
  //       __v: 0,}
  //     },
  //     {$skip:HelperUtil.pageSkip(
  //       Number(listReq?.page) ?? 0,
  //       Number(listReq?.limit) ?? Number(process.env.PAGINATION_LIMIT)
  //     )},
  //     {$limit:Number(listReq?.limit) ?? Number(process.env.PAGINATION_LIMIT) ?? 10},
    
  // ]);
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
    .populate('role city district province parkingAreaId', '_id name address parkingOwnerId')
    .select('firstName lastName email phoneNumber nic line1 line2 city district province zipCode isActive approvalStatus profileImage vehicle cards accountDetails parkingAreaId role');
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
    email:email.toLowerCase(),
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

async function updatePassword(
  userId: string,
  plainPassword: string
): Promise<boolean> {
  try {
    const user = await UserDTO.findById(new mongoose.Types.ObjectId(userId));
    if (!user) {
      throw new Error('User not found');
    }
    
    user.password = plainPassword; // Plain password, pre-save hook will hash it
    const result = await user.save();
    return result != null;
  } catch (e) {
    throw e as Error;
  }
}

// Add or update user
async function updateUser(
  data: any,
  userId: string
): Promise<string | null> {
  // If $set contains cards, update them
  if (data.$set && data.$set.cards) {
    await UserDTO.updateOne({ _id: userId }, { $set: { cards: data.$set.cards } });
    delete data.$set.cards;
  }
  // If $set contains vehicle, update them
  if (data.$set && data.$set.vehicle) {
    await UserDTO.updateOne({ _id: userId }, { $set: { vehicle: data.$set.vehicle } });
    delete data.$set.vehicle;
  }
  // If $set contains accountDetails, update them
  if (data.$set && data.$set.accountDetails) {
    await UserDTO.updateOne({ _id: userId }, { $set: { accountDetails: data.$set.accountDetails } });
    delete data.$set.accountDetails;
  }
  // Update other fields
  const result = await UserDTO.updateOne({ _id: userId }, data);
  return result.modifiedCount > 0 ? userId : null;
}

async function adminUpdateUser(
  data: any,
  userId: string
): Promise<string | null> {
  // If cards present, update them
  if (data.cards) {
    await UserDTO.updateOne({ _id: userId }, { $set: { cards: data.cards } });
    delete data.cards;
  }
  // If vehicle present, update them
  if (data.vehicle) {
    await UserDTO.updateOne({ _id: userId }, { $set: { vehicle: data.vehicle } });
    delete data.vehicle;
  }
  // If accountDetails present, update them
  if (data.accountDetails) {
    await UserDTO.updateOne({ _id: userId }, { $set: { accountDetails: data.accountDetails } });
    delete data.accountDetails;
  }
  // Update other fields
  const result = await UserDTO.updateOne({ _id: userId }, { $set: data });
  return result.modifiedCount > 0 ? userId : null;
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
  updatePassword,
  updateUser,
  adminUpdateUser,
  findByRole,
  softDeleteById,
  hardDeleteById,
  findPendingOwnersCount,
  findByMobileNumber
};
