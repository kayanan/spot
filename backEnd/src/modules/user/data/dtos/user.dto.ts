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
  address?: Address;
  phoneNumber?: string;
  otp?: string;
  otpExpiresAt?: Date;
  profileImage?: string;
  isActive?: boolean;
  approvalStatus?: boolean;
  vehicle: Array<{ vehicleNumber: String, isDefault: boolean }>;
  cardDetails?: Array<CardDetail>;
  accountDetails?: Array<AccountDetail>;
  isDeleted: boolean;
}
export interface Address {
  line1: string;
  line2: string;
  city: string;
  district: string;
  province: string;
  zipCode: string;
}

export interface CardDetail {
  nameOnCard: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  isDefault: boolean;
}

export interface AccountDetail {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  isDefault: boolean;
}
const AddressSchema = new Schema<Address>({
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  district: { type: String, required: true },
  province: { type: String, required: true },
});

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
    address: {
      type: AddressSchema,
    },
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
    cardDetails: [
      {
        nameOnCard: { type: String, required: true, match: [/^[a-zA-Z\s]+$/, "Please enter a valid name."] },
        cardNumber: { type: String, required: true, match: [/^[0-9]{16}$/, "Please enter a valid card number."] },
        expiryDate: { type: String, required: true, match: [/^[0-1][0-9]\/[0-9]{2}$/, "Please enter a valid expiry date."] },
        cvv: { type: String, required: true, match: [/^[0-9]{3}$/, "Please enter a valid CVV."] },
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
