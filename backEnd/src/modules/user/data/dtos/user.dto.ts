import mongoose, { ObjectId, Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { BaseDTO } from '../../../base/data/dtos/base.dto';

export interface UserModel extends BaseDTO {
  firstName: string;
  lastName: string;
  nic: string;
  email: string;
  password: string;
  role: Array<ObjectId>;
  line1: string;
  line2: string;
  city: string;
  district: string;
  province: string;
  zipCode: string;
  phoneNumber?: string;
  otp?: string;
  otpExpiresAt?: Date;
  profileImage?: string;
  isActive?: boolean;
  approvalStatus?: boolean;
  vehicle: Array<{ vehicleNumber: String, isDefault: boolean }>;
  accountDetails?: Array<AccountDetail>;
  isDeleted: boolean;
}



export interface AccountDetail {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  isDefault: boolean;
}


const UserSchema = new Schema<UserModel>(
  {
    //Role
    role: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Role',
      required: true,
      index: 1,
    },
    //Asset
    profileImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      index: 1,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    nic: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^(\d{9}[V|v])|(\d{4}\s?\d{4}\s?\d{4})$/,
        "Please enter a valid Sri Lankan NIC number.",
      ],
    },
    email: {
      type: String,
      required: false,
      unique: true,
      match:
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    },
    password: { type: String },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
    zipCode: { type: String, required: false },
    phoneNumber:
    {
      type: String,
      required: true,
      match: [
        /^07[01245678][0-9]{7}$/,
        "Please enter a valid Sri Lankan Mobile phone number. Eg(0712345678)",
      ],
    },

    otp: { type: String },
    otpExpiresAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    approvalStatus: { type: Boolean, default: false },
    vehicle: [
      {
        vehicleNumber: { type: String, required: true },
        isDefault: { type: Boolean, required: true, default: false },
      },
    ],
    
    accountDetails: [
      {
        accountHolderName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        bankName: { type: String, required: true },
        branchName: { type: String, required: true },
        isDefault: { type: Boolean, required: true, default: false },
      },
    ],
  },
  { timestamps: true }

);

//setup the pre hook, so everytime we create or update the user with password field with new value, it's gonna encrypt the password.
UserSchema.pre(['save'], async function (next) {
  if (this.isModified('password') && this.password != null) {
    //salt rounds = 8
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export const UserDTO = model<UserModel>('User', UserSchema);
