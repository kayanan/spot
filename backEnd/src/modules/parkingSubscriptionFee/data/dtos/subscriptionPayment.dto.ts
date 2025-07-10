import { ObjectId, Schema, model } from "mongoose";
import { BaseDTO } from "../../../base/data/dtos/base.dto";

export enum PaymentMethod {
  CARD = "CARD",
  MOBILE_PAYMENT = "MOBILE_PAYMENT",
  BANK_TRANSFER = "BANK_TRANSFER",
  QR_CODE = "QR_CODE",
}
export enum PaymentGateway {
  PAYHERE = "PAYHERE",
  STRIPE = "STRIPE",
}
export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}
export interface PaymentDetails {
  cardNumber?:string;
  cardHolderName?:string;
  cardExpiryMonth?:string;
  cardExpiryYear?:string;
  bankName?:string;
  branch?:string;
  referenceNumber?:string;
  images?:string[];
  
}
export interface SubscriptionPaymentModel extends BaseDTO {
  parkingOwnerId:ObjectId | string;
  parkingAreaId:ObjectId | string;
  amount:number;
  paymentStatus:PaymentStatus;
  paymentDate:Date;
  paymentMethod:PaymentMethod;
  paymentReference:string;
  paymentDetails:PaymentDetails;
  paymentGateway:PaymentGateway;
  isDeleted:boolean;
  createdBy:ObjectId | string;
  subscriptionStartDate:Date;
  subscriptionEndDate:Date;
  createdAt?:Date;
  updatedAt?:Date;
}

const SubscriptionPaymentSchema = new Schema<SubscriptionPaymentModel>({
  parkingOwnerId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  parkingAreaId: { type: Schema.Types.ObjectId, required: true, ref: "ParkingArea" },
  amount: { type: Number, required: true },
  paymentStatus: { type: String, enum: PaymentStatus, required: true },
  paymentDate: { type: Date, required: true },
  paymentMethod: { type: String, enum: PaymentMethod, required: true },
  paymentDetails: { type: Object, required: false },
  paymentReference: { type: String, required: false },
  paymentGateway: { type: String, enum: PaymentGateway, required: false },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  subscriptionStartDate: { type: Date, required: false },
  subscriptionEndDate: { type: Date, required: false },

},{timestamps:true});

export const SubscriptionPaymentDTO = model<SubscriptionPaymentModel>("SubscriptionPayment", SubscriptionPaymentSchema);