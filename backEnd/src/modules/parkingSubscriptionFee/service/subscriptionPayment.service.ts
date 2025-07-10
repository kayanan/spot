import { ObjectId, Types } from "mongoose";
import { updateParkingArea, updateParkingAreaByOwnerId } from "../../parkingArea/repository/parkingArea.repository";
import { PaymentGateway, PaymentMethod, PaymentStatus, SubscriptionPaymentModel } from "../data/dtos/subscriptionPayment.dto";
import { createSubscriptionPayment, getSubscriptionPayments, getSubscriptionPaymentById, updateSubscriptionPayment, softDeleteSubscriptionPayment, deleteSubscriptionPayment } from "./../data/repositories/subscriptionPayment.repository"
import crypto from "crypto";
import md5 from "crypto-js/md5";

export const createSubscriptionPaymentService = async (rawSubscriptionPayment: Partial<SubscriptionPaymentModel & {images?:string[],bankName?:string,branch?:string,referenceNumber?:string}>) => {
  console.log(rawSubscriptionPayment,"--------------------------------rawSubscriptionPayment--------------------------------");
    const subscriptionPayment = {
      parkingOwnerId:rawSubscriptionPayment?.parkingOwnerId || "",
      parkingAreaId:rawSubscriptionPayment?.parkingAreaId || "",
      amount:rawSubscriptionPayment?.amount || 0,
      paymentStatus:PaymentStatus.PENDING,
      paymentDate:new Date(),
      paymentMethod:PaymentMethod.BANK_TRANSFER,
      paymentReference:rawSubscriptionPayment.paymentReference,
      paymentDetails: {
        bankName:rawSubscriptionPayment.bankName,
        branch:rawSubscriptionPayment.branch,
        referenceNumber:rawSubscriptionPayment.referenceNumber,
        images: rawSubscriptionPayment.images
    },
      createdBy:rawSubscriptionPayment.parkingOwnerId,
        
      }
    const newSubscriptionPayment = await createSubscriptionPayment(subscriptionPayment);
    return newSubscriptionPayment;
};

export const getSubscriptionPaymentsService = async (data: Partial<SubscriptionPaymentModel>) => {

    const subscriptionPayments = await getSubscriptionPayments({});
    return subscriptionPayments;
};

export const getSubscriptionPaymentByIdService = async (id: string) => {
    const subscriptionPayment = await getSubscriptionPaymentById(id);
    return subscriptionPayment;
};

export const updateSubscriptionPaymentService = async (id: string, subscriptionPayment: SubscriptionPaymentModel) => {
    const updatedSubscriptionPayment = await updateSubscriptionPayment(id, subscriptionPayment);
    return updatedSubscriptionPayment;
};

export const softDeleteSubscriptionPaymentService = async (id: string) => {
    const deletedSubscriptionPayment = await softDeleteSubscriptionPayment(id);
    return deletedSubscriptionPayment;
};

export const deleteSubscriptionPaymentService = async (id: string) => {
    const deletedSubscriptionPayment = await deleteSubscriptionPayment(id);
    return deletedSubscriptionPayment;
};

export const getSubscriptionPaymentByParkingAreaIdService = async (id: string) => {
    const subscriptionPayment = await getSubscriptionPayments({parkingAreaId:id,isDeleted:false});
    return subscriptionPayment;
};

export const generateHashService = async (body: any) => {
    const { order_id, amount, currency } = body;
    const hashedMerchantSecret = crypto
    .createHash("md5")
    .update(process.env.MERCHANT_SECRET!)
    .digest("hex")
    .toString()
    .toUpperCase();
    const hash = crypto
    .createHash("md5")
    .update(
      process.env.MERCHANT_ID!.toString() +
        order_id +
        amount +
        currency +
        hashedMerchantSecret
    )
    .digest("hex")
    .toUpperCase();
    // let merchantSecret  = process.env.MERCHANT_SECRET!;
    // let merchantId      = process.env.MERCHANT_ID!;
    // let hashedSecret    = md5(merchantSecret).toString().toUpperCase();
    // let amountFormated  = parseFloat( amount ).toLocaleString( 'en-us', { minimumFractionDigits : 2 } ).replace(/,/g, '');
    // console.log(merchantId,order_id,amountFormated,currency,hashedSecret);
    // let hash            = md5(merchantId + order_id + amountFormated + currency + hashedSecret).toString().toUpperCase();
    return {hash,merchant_id:process.env.MERCHANT_ID};
};

export const notifyPaymentService = async (body: any) => {
  console.log(body,"--------------------------------body--------------------------------");
    const {
        merchant_id,
        order_id,
        payhere_amount,
        payhere_currency,
        status_code,
        md5sig,
      } = body;
      const local_md5sig = crypto
      .createHash("md5")
      .update(
        merchant_id +
          order_id +
          payhere_amount +
          payhere_currency +
          status_code +
          crypto
            .createHash("md5")
            .update(process.env.MERCHANT_SECRET!.toString())
            .digest("hex")
            .toUpperCase()
      )
      .digest("hex")
      .toUpperCase();
      if (local_md5sig === md5sig && status_code == "2") {
        const subscriptionPayment = {
            parkingOwnerId: body?.custom_1 || "",
            parkingAreaId: body?.custom_2 || "",
            amount: body?.payhere_amount || 0,
            paymentStatus: PaymentStatus.SUCCESS,
            paymentDate: new Date(),
            paymentMethod: PaymentMethod.CARD,
            paymentReference: body?.payment_id || "",
            paymentDetails: {
                cardNumber: body?.card_no || "",
                cardHolderName: body?.card_holder_name || "",
                cardExpiryMonth: body?.card_exp?.split("/")[0] || "",
                cardExpiryYear: body?.card_exp?.split("/")[1] || "",
            },
            paymentGateway: PaymentGateway.PAYHERE,
            createdBy: body?.custom_1 || "",
            subscriptionStartDate: new Date(),
            subscriptionEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        }
        const newSubscriptionPayment = await createSubscriptionPayment(subscriptionPayment);
        if(newSubscriptionPayment){
          // want to implement  in redis if falback to database
            await updateParkingArea(body?.custom_2, {parkingSubscriptionPaymentId:newSubscriptionPayment._id as ObjectId});
        
            return {success:true,message:"Payment successful"};
        }else{
            return {success:false,message:"Payment verification failed"};
        }
        // Payment success - update the database
        return {success:true,message:"Payment successful"};
      } else {
        const subscriptionPayment = {
            parkingOwnerId: body?.custom_1 || "",
            parkingAreaId: body?.custom_2 || "",
            amount: body?.payhere_amount || 0,
            paymentStatus: PaymentStatus.FAILED,
            paymentDate: new Date(),
            paymentMethod: PaymentMethod.CARD,
            paymentReference: body?.payment_id || "",
            paymentDetails: {
                cardNumber: body?.card_no || "",
                cardHolderName: body?.card_holder_name || "",
                cardExpiryMonth: body?.card_exp?.split("/")[0] || "",
                cardExpiryYear: body?.card_exp?.split("/")[1] || "",
            },
            paymentGateway: PaymentGateway.PAYHERE,
            createdBy: body?.custom_1 || "",
        }
        const newSubscriptionPayment = await createSubscriptionPayment(subscriptionPayment);
        // Payment verification failed
        return {success:false,message:"Payment verification failed"};
      }
};












