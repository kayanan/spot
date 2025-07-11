import { Request, Response } from "express";
import { ReservationPaymentModel } from "../data/dtos/reservationPayment.dto";
import {
  createReservationPaymentService,
  updateReservationPaymentService,
  deleteReservationPaymentService,
  getReservationPaymentByIdService,
  getAllReservationPaymentsService,
  getReservationPaymentsByReservationService,
  getReservationPaymentsByCustomerService,
  getReservationPaymentsByParkingAreaService,
  getReservationPaymentsByParkingSlotService,
  getReservationPaymentsByPaymentStatusService,
  getReservationPaymentsByPaymentMethodService,
  getReservationPaymentsByDateRangeService,
  getReservationPaymentByReferenceNumberService,
  getReservationPaymentsByPaidByService,
  getReservationPaymentsByAmountRangeService,
  getSuccessfulPaymentsService,
  getFailedPaymentsService,
  getPendingPaymentsService,
  getRefundedPaymentsService,
  generateHashService,
  notifyPaymentService
} from "../service/reservationPayment.service";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/reservationPayment");
  },
  filename: (req, file, cb) => {
    cb(null, `RP-${uuidv4()}${ path.extname(file.originalname)}`);
  }
});

const upload = multer({  storage: storage });

export const createReservationPaymentHandler = [upload.array("images", 10), async (req: Request, res: Response) => {
  try {
    const paymentData = req.body as Omit<ReservationPaymentModel, "isDeleted">;
    const paymentImages = req.files as Express.Multer.File[];
    if(paymentImages && paymentImages.length > 0){
      const paymentImagesUrls = paymentImages.map((image) => `/reservationPayment/${image.filename}`);
      paymentData.images = paymentImagesUrls as Array<string> ;
    }
    const payment = await createReservationPaymentService(paymentData);
    res.status(201).json({
      success: true,
      data: payment,
      message: "Reservation payment created successfully"
    });
  } catch (error: unknown) {
    console.log(error);
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
        console.log(error);
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
}];

export const updateReservationPaymentHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paymentData = req.body as Partial<ReservationPaymentModel>;
    const payment = await updateReservationPaymentService(id, paymentData);
    res.status(200).json({
      success: true,
      data: payment,
      message: "Reservation payment updated successfully"
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const deleteReservationPaymentHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteReservationPaymentService(id);
    res.status(200).json({ 
      success: true,
      message: "Reservation payment deleted successfully" 
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const getReservationPaymentByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const payment = await getReservationPaymentByIdService(id);
    if (!payment) {
      res.status(404).json({ 
        success: false,
        message: "Reservation payment not found" 
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const getAllReservationPaymentsHandler = async (req: Request, res: Response) => {
  try {
   // Get all payments first
    const payments = await getAllReservationPaymentsService( req.query);

    res.status(200).json({
      success: true,
      count: payments.total,
      data: payments.data,
    });
  } catch (error: unknown) {
    console.log(error);
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const getReservationPaymentsByReservationHandler = async (req: Request, res: Response) => {
  try {
    const { reservationId } = req.params;
    const payments = await getReservationPaymentsByReservationService(reservationId);
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error: unknown) {
    console.log(error);
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const getReservationPaymentsByCustomerHandler = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const payments = await getReservationPaymentsByCustomerService(customerId);
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const getReservationPaymentsByParkingAreaHandler = async (req: Request, res: Response) => {
  try {
    const { parkingAreaId } = req.params;
    const payments = await getReservationPaymentsByParkingAreaService(parkingAreaId);
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const getReservationPaymentsByParkingSlotHandler = async (req: Request, res: Response) => {
  try {
    const { parkingSlotId } = req.params;
    const payments = await getReservationPaymentsByParkingSlotService(parkingSlotId);
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const getReservationPaymentsByPaymentStatusHandler = async (req: Request, res: Response) => {
  try {
    const { paymentStatus } = req.params;
    const payments = await getReservationPaymentsByPaymentStatusService(paymentStatus);
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const getReservationPaymentsByPaymentMethodHandler = async (req: Request, res: Response) => {
  try {
    const { paymentMethod } = req.params;
    const payments = await getReservationPaymentsByPaymentMethodService(paymentMethod);
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const getReservationPaymentsByDateRangeHandler = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      res.status(400).json({ 
        success: false,
        message: "Start date and end date are required" 
      });
      return;
    }
    const payments = await getReservationPaymentsByDateRangeService(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const getReservationPaymentByReferenceNumberHandler = async (req: Request, res: Response) => {
  try {
    const { referenceNumber } = req.params;
    const payment = await getReservationPaymentByReferenceNumberService(referenceNumber);
    if (!payment) {
      res.status(404).json({ 
        success: false,
        message: "Reservation payment not found" 
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const getReservationPaymentsByPaidByHandler = async (req: Request, res: Response) => {
  try {
    const { paidById } = req.params;
    const payments = await getReservationPaymentsByPaidByService(paidById);
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const getReservationPaymentsByAmountRangeHandler = async (req: Request, res: Response) => {
  try {
    const { minAmount, maxAmount } = req.params;
    const payments = await getReservationPaymentsByAmountRangeService(
      parseFloat(minAmount),
      parseFloat(maxAmount)
    );
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const getSuccessfulPaymentsHandler = async (req: Request, res: Response) => {
  try {
    const payments = await getSuccessfulPaymentsService();
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const getFailedPaymentsHandler = async (req: Request, res: Response) => {
  try {
    const payments = await getFailedPaymentsService();
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const getPendingPaymentsHandler = async (req: Request, res: Response) => {
  try {
    const payments = await getPendingPaymentsService();
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const getRefundedPaymentsHandler = async (req: Request, res: Response) => {
  try {
    const payments = await getRefundedPaymentsService();
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
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

export const notifyPaymentController = async (req: Request, res: Response) => {
  try{
  const notifyPayment = await notifyPaymentService(req.body);
  if(notifyPayment.success){  
      res.status(200).json({message:"Payment successful"});
  }else{
      res.status(400).json({message:"Payment verification failed"});
  }
  }catch(error){
      console.log(error);
      res.status(500).send(error);
  }
};