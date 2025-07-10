import { ObjectId } from "mongoose";
import { SubscriptionPaymentDTO, SubscriptionPaymentModel } from "../dtos/subscriptionPayment.dto";

export const createSubscriptionPayment = async (subscriptionPayment: Partial<SubscriptionPaymentModel>) => {
    const newSubscriptionPayment = await SubscriptionPaymentDTO.create(subscriptionPayment);
    return newSubscriptionPayment as unknown as SubscriptionPaymentModel & {_id:string | ObjectId};
};


export const getSubscriptionPayments = async (data: Partial<SubscriptionPaymentModel>) => {
    const query:any = {isDeleted:{$ne:true}} ;
    if(data.parkingOwnerId){
        query.parkingOwnerId = data.parkingOwnerId;
    }
    if(data.parkingAreaId){
        query.parkingAreaId = data.parkingAreaId;
    }
    if(data.paymentStatus){
        query.paymentStatus = data.paymentStatus;
    }
    const subscriptionPayments = await SubscriptionPaymentDTO.find(query).sort({createdAt:-1});
    return subscriptionPayments;
};

export const getSubscriptionPaymentById = async (id: string) => {
    const subscriptionPayment = await SubscriptionPaymentDTO.findById(id);
    return subscriptionPayment;
};

export const updateSubscriptionPayment = async (id: string, subscriptionPayment: SubscriptionPaymentModel) => {
    const updatedSubscriptionPayment = await SubscriptionPaymentDTO.findByIdAndUpdate(id, subscriptionPayment, { new: true });
    return updatedSubscriptionPayment;
};

export const softDeleteSubscriptionPayment = async (id: string) => {
    const deletedSubscriptionPayment = await SubscriptionPaymentDTO.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    return deletedSubscriptionPayment;
};

export const deleteSubscriptionPayment = async (id: string) => {
    const deletedSubscriptionPayment = await SubscriptionPaymentDTO.findByIdAndDelete(id);
    return deletedSubscriptionPayment;
};



