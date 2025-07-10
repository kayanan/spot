import { Request, Response } from "express";
import { ReservationModel } from "../data/dtos/reservation.dto";
import {
  updateReservationService,
  deleteReservationService,
  getReservationByIdService,
  getAllReservationsService,
  getReservationsByUserService,
  getReservationsByParkingAreaService,
  getReservationsByParkingSlotService,
  getActiveReservationsService,
  getReservationsByStatusService,
  getReservationsByPaymentStatusService,
  getReservationByVehicleNumberService,
  getReservationsByDateRangeService,
  getReservationsByMobileNumberService,
  completeReservationService,
  cancelReservationService,
  updatePaymentStatusService,
  createReservationService,
  changeSlotService,
  calculateFinalAmountService
} from "../service/reservation.service";

export const createReservationHandler = async (req: Request, res: Response) => {
  try {
    const reservationData = req.body as Omit<ReservationModel, "isDeleted">;
    const reservation = await createReservationService(reservationData);
    res.status(201).json({
      success: true,
      data: reservation,
      message: "Reservation created successfully"
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error,"error1");
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      console.log(error,"error2");
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const updateReservationHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reservationData = req.body as Partial<ReservationModel>;
    const reservation = await updateReservationService(id, reservationData);
    res.status(200).json({
      success: true,
      data: reservation,
      message: "Reservation updated successfully"
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

export const deleteReservationHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteReservationService(id);
    res.status(200).json({ 
      success: true,
      message: "Reservation deleted successfully" 
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

export const getReservationByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const reservation = await getReservationByIdService(id);
    if (!reservation) {
      return res.status(404).json({ 
        success: false,
        message: "Reservation not found" 
      });
    }
    res.status(200).json({
      success: true,
      data: reservation
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

export const getAllReservationsHandler = async (req: Request, res: Response) => {
  try {
    const { 
      startDate, 
      endDate, 
      parkingArea, 
      paymentStatus, 
      paymentType 
    } = req.query;

    let reservations;

    // Apply filters based on query parameters
    if (startDate && endDate) {
      // Filter by date range
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      reservations = await getReservationsByDateRangeService(start, end);
    } else if (parkingArea) {
      // Filter by parking area
      reservations = await getReservationsByParkingAreaService(parkingArea as string);
    } else if (paymentStatus) {
      // Filter by payment status
      reservations = await getReservationsByPaymentStatusService(paymentStatus as string);
    } else {
      // Get all reservations
      reservations = await getAllReservationsService();
    }

    // Apply additional filters if multiple filters are provided
    if (reservations && reservations.length > 0) {
      if (parkingArea && !startDate && !endDate && !paymentStatus) {
        // Already filtered by parking area
      } else if (parkingArea) {
        reservations = reservations.filter(r => r.parkingArea?.toString() === parkingArea);
      }

      if (paymentStatus && !startDate && !endDate && !parkingArea) {
        // Already filtered by payment status
      } else if (paymentStatus) {
        reservations = reservations.filter(r => r.paymentStatus === paymentStatus);
      }

          // if (paymentType) {
          //   reservations = reservations.filter(r => r.paymentType === paymentType);
          // }
    }

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
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

export const getReservationsByUserHandler = async (req: Request, res: Response) => {
  try {
    
    const reservations = await getReservationsByUserService(req.query as unknown as { userId: string, status: string, paymentStatus: string, startDate: string, endDate: string, searchTerm: string, page: number, limit: number ,isParked:boolean});
    res.status(200).json({
      success: true,
      count: reservations.count,
      data: reservations.result
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

export const getReservationsByParkingAreaHandler = async (req: Request, res: Response) => {
  try {
    const { parkingAreaId } = req.params;
    const reservations = await getReservationsByParkingAreaService(parkingAreaId);
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
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

export const getReservationsByParkingSlotHandler = async (req: Request, res: Response) => {
  try {
    const { parkingSlotId } = req.params;
    const reservations = await getReservationsByParkingSlotService(parkingSlotId);
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
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

export const getActiveReservationsHandler = async (req: Request, res: Response) => {
  try {
    const reservations = await getActiveReservationsService(req.query as unknown as {  page: number, limit: number,userId:string });
    res.status(200).json({
      success: true,
      count: reservations.count,
      data: reservations.result
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

export const getReservationsByStatusHandler = async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const reservations = await getReservationsByStatusService(status);
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
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

export const getReservationsByPaymentStatusHandler = async (req: Request, res: Response) => {
  try {
    const { paymentStatus } = req.params;
    const reservations = await getReservationsByPaymentStatusService(paymentStatus);
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
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

export const getReservationByVehicleNumberHandler = async (req: Request, res: Response) => {
  try {
    const { vehicleNumber } = req.params;
    const reservation = await getReservationByVehicleNumberService(vehicleNumber);
    if (!reservation) {
      return res.status(200).json({ 
        success: false,
        message: "Vehicle not reserved" 
      });
    }
    res.status(200).json({
      success: true,
      data: reservation
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

export const getReservationsByDateRangeHandler = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false,
        message: "Start date and end date are required" 
      });
    }
    const reservations = await getReservationsByDateRangeService(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
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

export const getReservationsByMobileNumberHandler = async (req: Request, res: Response) => {
  try {
    const { mobileNumber } = req.params;
    const reservations = await getReservationsByMobileNumberService(mobileNumber);
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
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

export const completeReservationHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reservation = await completeReservationService(id);
    res.status(200).json({
      success: true,
      data: reservation,
      message: "Reservation completed successfully"
    });
  } catch (error: unknown) {
    console.log(error, "error");
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
export const calculateFinalAmountHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reservation = await calculateFinalAmountService(id);
    res.status(200).json({
      success: true,
      data: reservation,
      message: "Final amount calculated successfully"
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }
}

export const cancelReservationHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reservation = await cancelReservationService(id);
    res.status(200).json({
      success: true,
      data: reservation,
      message: "Reservation cancelled successfully"
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

export const updatePaymentStatusHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    if (!paymentStatus) {
      return res.status(400).json({ 
        success: false,
        message: "Payment status is required" 
      });
    }
    const reservation = await updatePaymentStatusService(id, paymentStatus);
    res.status(200).json({
      success: true,
      data: reservation,
      message: "Payment status updated successfully"
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

export const createPreBookingReservationHandler = async (req: Request, res: Response) => {
  try {
    const reservationData = req.body as Partial<ReservationModel>;
    const reservation = await createReservationService(reservationData);
    res.status(200).json({
      success: true,
      data: reservation,
      message: "Pre-booking reservation created successfully"
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error, "error1");
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      console.log(error, "error2");
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

export const changeSlotHandler = async (req: Request, res: Response) => {
  try {
    const { id: reservationId } = req.params;
    const reservation = await changeSlotService(reservationId);
    res.status(200).json({
      success: true,
      data: reservation,
      message: "Slot changed successfully"
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error, "error3");
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    } else {
      console.log(error, "error4");
      res.status(500).json({ 
        success: false,
        message: "An unknown error occurred" 
      });
    }
  }
};

