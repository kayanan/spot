import { Request, Response } from "express";
import { createSubscriptionPaymentService, getSubscriptionPaymentsService, getSubscriptionPaymentByIdService, updateSubscriptionPaymentService, softDeleteSubscriptionPaymentService, deleteSubscriptionPaymentService ,generateHashService, notifyPaymentService, getSubscriptionPaymentByParkingAreaIdService} from "../service/subscriptionPayment.service";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { PaymentGateway, PaymentMethod, PaymentStatus } from "../data/dtos/subscriptionPayment.dto";

// MULTER Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../../public/subscriptionPayment"));
    },
    filename: (req, file, cb) => {
        cb(null, `SP-${uuidv4()}-${Date.now()}.${file.mimetype.split("/")[1]}`);
    },
});
const uploadSubscriptionPayment = multer({ storage });

export const createSubscriptionPaymentController = [uploadSubscriptionPayment.array('images', 5), async (req: Request, res: Response) => {
    try {
        const subscriptionPayment = req.body;
        
        const images = req.files as Express.Multer.File[];
        // Handle case when no images are uploaded
        if (!images || images.length === 0) {
            return res.status(400).json({
                message: "Please upload at least one payment receipt image"
            });
        }

        // Add images to payment details rather than root level
        const paymentDetails = {
            bankName: subscriptionPayment.bankName,
            branch: subscriptionPayment.branch, 
            referenceNumber: subscriptionPayment.referenceNumber,
            images: images.map(image => image.filename)
        };

        subscriptionPayment.paymentDetails = paymentDetails;
        subscriptionPayment.paymentStatus = PaymentStatus.PENDING;
        subscriptionPayment.paymentDate = new Date();
        subscriptionPayment.paymentMethod = PaymentMethod.BANK_TRANSFER;
        subscriptionPayment.paymentReference = subscriptionPayment.referenceNumber;
        subscriptionPayment.createdBy = subscriptionPayment.parkingOwnerId;

        // Remove fields that are now in paymentDetails
        delete subscriptionPayment.bankName;
        delete subscriptionPayment.branch;
        delete subscriptionPayment.referenceNumber;
        delete subscriptionPayment.images;

        const newSubscriptionPayment = await createSubscriptionPaymentService(subscriptionPayment);
        res.status(201).json(newSubscriptionPayment);
    } catch(error) {
        console.error("Error creating subscription payment:", error);
        res.status(500).json({
            message: "Failed to create subscription payment",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}];

export const getSubscriptionPaymentsController = async (req: Request, res: Response) => {
    try{
        const subscriptionPayments = await getSubscriptionPaymentsService({});
        res.status(200).json(subscriptionPayments);
    }catch(error){
        res.status(500).send(error);
    }
};

export const getSubscriptionPaymentByIdController = async (req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const subscriptionPayment = await getSubscriptionPaymentByIdService(id);
        res.status(200).json(subscriptionPayment);
    }catch(error){
        res.status(500).send(error);
    }
};

export const updateSubscriptionPaymentController = async (req: Request, res: Response) => {
    try{    
    const { id } = req.params;
    const subscriptionPayment = req.body;
    const updatedSubscriptionPayment = await updateSubscriptionPaymentService(id, subscriptionPayment);
    res.status(200).json(updatedSubscriptionPayment);
    }catch(error){
        res.status(500).send(error);
    }
};

export const softDeleteSubscriptionPaymentController = async (req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const deletedSubscriptionPayment = await softDeleteSubscriptionPaymentService(id);
        res.status(200).json(deletedSubscriptionPayment);
    }catch(error){
        res.status(500).send(error);
    }
};

export const deleteSubscriptionPaymentController = async (req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const deletedSubscriptionPayment = await deleteSubscriptionPaymentService(id);
        res.status(200).json(deletedSubscriptionPayment);
    }catch(error){
        res.status(500).send(error);
    }
};

export const generateHashController = async (req: Request, res: Response) => {
    try{    
        const hash = await generateHashService(req.body);
        res.status(200).json(hash);
    }catch(error){
        res.status(500).send(error);
    }
};

export const getSubscriptionPaymentByParkingAreaIdController = async (req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const subscriptionPayment = await getSubscriptionPaymentByParkingAreaIdService(id);
        res.status(200).json(subscriptionPayment);
    }catch(error){
        res.status(500).send(error);
    }
};

export const notifyPaymentController = async (req: Request, res: Response) => {
    try{
    const notifyPayment = await notifyPaymentService(req.body);
    if(notifyPayment.success){  
        res.status(200).json({message:"Payment successful"});
    }else{
        res.status(400).json({message:"Payment verification failed"});
    }
    }catch(error){
        res.status(500).send(error);
    }
};