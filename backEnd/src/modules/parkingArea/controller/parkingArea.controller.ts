import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
    createParkingArea,
    updateParkingArea,
    deleteParkingArea,
    getParkingAreaById,
    getAllParkingAreas,
    getParkingAreasByOwnerId,
    checkDuplicateEntry,
    getNearestParkingSpots
} from "../service/parkingArea.service";
import { CreateUpdateParkingAreaRequest } from "./request/ceate.parkingArea.request";
import { ParkingSlotModel } from "../data/dtos/parkingSlot.dto";



// MULTER Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../../public/parkingArea"));
    },
    filename: (req, file, cb) => {
        cb(null, `PA-${uuidv4()}-${Date.now()}.${file.mimetype.split("/")[1]}`);
    },
});
const uploadParkingArea = multer({ storage });

export const createParkingAreaController = [uploadParkingArea.array("images", 5), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parkingAreaData: Partial<CreateUpdateParkingAreaRequest & { longitude: number, latitude: number, slot: { type: string, count: number }[] }> = req.body;
        if (parkingAreaData.slot) {
            if(Array.isArray(parkingAreaData.slot)){
                parkingAreaData.slot = parkingAreaData.slot.map((slot) => JSON.parse(slot as unknown as string));
            }
            else{
                parkingAreaData.slot = [JSON.parse(parkingAreaData.slot as unknown as string)];
            }
        }
        const images = req.files as Express.Multer.File[];
        parkingAreaData.images = images.map((image) => image.filename);

        const result = await createParkingArea(parkingAreaData);
        res.status(201).json({
            success: true,
            message: "Parking area created successfully",
            data: result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}];

export const updateParkingAreaController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const parkingAreaData: CreateUpdateParkingAreaRequest = req.body;
        const result = await updateParkingArea(id, parkingAreaData);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Parking area not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Parking area updated successfully",
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const deleteParkingAreaController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await deleteParkingArea(id);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Parking area not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Parking area deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getParkingAreaByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await getParkingAreaById(id);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Parking area not found",
            });
        }
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getAllParkingAreasController = async (req: Request, res: Response) => {
    try {
        const result = await getAllParkingAreas();
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// export const getActiveParkingAreasController = async (req: Request, res: Response) => {
//     try {
//         const result = await getActiveParkingAreas();
//         res.status(200).json({
//             success: true,
//             data: result,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Internal server error",
//         });
//     }
// };

export const getParkingAreasByOwnerIdController = async (req: Request, res: Response) => {
    try {
        const { ownerId } = req.params;
        const result = await getParkingAreasByOwnerId(ownerId);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}; 

export const checkDuplicateEntryController = async (req: Request, res: Response) => {
    try {
        const response = await checkDuplicateEntry(req.body);
        if(response.status){
            res.status(200).json(response);
        }
        else{
            res.status(400).json(response);
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export const getNearestParkingSpotsHandler = async (req: Request, res: Response) => {
    try {
      const { coords,radius=100000 ,vehicleType,startTime,endTime} = req.body;
      const slotFilterData:{vehicleType:string,startTime:Date,endTime?:Date}= {
        vehicleType:vehicleType,
        startTime:new Date(startTime),
        }
      if(endTime){
        slotFilterData.endTime = new Date(endTime);
      }
      console.log(coords,radius,slotFilterData);
      const result = await getNearestParkingSpots(coords,radius,slotFilterData);
      res.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error,"error");
        res.status(500).json({ message: error.message });
      } else {
        console.log(error,"error2");
        res.status(500).json({ message: "An unknown error occurred" });
       
      }
    }
  };