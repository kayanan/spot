import {
    createParkingArea as createParkingAreaRepo,
    updateParkingArea as updateParkingAreaRepo,
    deleteParkingArea as deleteParkingAreaRepo,
    getParkingAreaById as getParkingAreaByIdRepo,
    getAllParkingAreas as getAllParkingAreasRepo,
    getActiveParkingAreas as getActiveParkingAreasRepo,
    getParkingAreasByOwnerId as getParkingAreasByOwnerIdRepo,
    updateParkingAreaByOwnerId as updateParkingAreaByOwnerIdRepo,
    deleteParkingAreaByOwnerId as deleteParkingAreaByOwnerIdRepo,
} from "../repository/parkingArea.repository";
import { validateCreateParkingArea, validateUpdateParkingArea } from "../validators/parkingArea.validator";
import { CreateUpdateParkingAreaRequest } from "../controller/request/ceate.parkingArea.request";
import { ParkingAreaDTO, ParkingAreaModel } from "../data/dtos/parkingArea.dto";
import { createSlot, filterParkingSlots, getSlotsByParkingArea as getSlotsByParkingAreaRepo } from "./parkingSlot.service";
import { CreateUpdateParkingSlotRequest } from "../controller/request/create.parkingSlot.request";
import { updateParkingSlotStatus } from "./parkingSlot.service";
import { sendSMS } from "../../base/services/sms.service";
import UserRepository from "../../user/data/repository/user.repository";
import { BaseResponse } from "../../base/controller/responses/base.repsonse";
import { ParkingSlotDTO } from "../data/dtos/parkingSlot.dto";
import { FilterQuery } from "mongoose";
import mongoose from "mongoose";
export const createParkingArea = async (parkingAreaData: Partial<CreateUpdateParkingAreaRequest & { longitude: number, latitude: number, slot: { type: string, count: number }[] }>) => {
    const { error } = validateCreateParkingArea(parkingAreaData);
    if (error) {
        throw new Error('Validation failed');
    }
    parkingAreaData.location = {
        type: "Point",
        coordinates: [Number(parkingAreaData.longitude), Number(parkingAreaData.latitude)],
    };
    delete parkingAreaData.longitude;
    delete parkingAreaData.latitude;
    const slot = parkingAreaData?.slot;
    delete parkingAreaData?.slot;
    parkingAreaData.isActive = false;
    const [parkingArea, owner] = await Promise.all([
        createParkingAreaRepo(parkingAreaData as unknown as ParkingAreaModel),
        UserRepository.findById(parkingAreaData.ownerId as string)
    ])
    const parkingAreaId = parkingArea?._id as string;
    if (slot) {
        const slotData = slot.filter((item) => Number(item.count) > 0).map((item) => ({
            slotDetails: {
                vehicleType: item.type,
                isActive: false,
                isDeleted: false,
            } as Partial<CreateUpdateParkingSlotRequest>,
            count: item.count as number,
            parkingAreaId: parkingAreaId,
        }));
        await createSlot(slotData);
    }

    const mobileNumber = owner?.phoneNumber?.replace(/^0/, '94');
    if (!mobileNumber) throw new Error('Mobile number not found');
    const message = `Your parking area creation request has been successfully submitted.
     You will be able to start using it once it's approved by logging in with your email and password.
      - FindMySpot`;

    await sendSMS(mobileNumber, message);
    return parkingArea;
};

export const updateParkingArea = async (id: string, parkingAreaData: CreateUpdateParkingAreaRequest) => {
    const { error } = validateUpdateParkingArea(parkingAreaData);
    if (error) {
        throw new Error('Validation failed');
    }
    if (Object.keys(parkingAreaData).includes('isActive')) {
        await updateParkingSlotStatus([id], parkingAreaData.isActive as boolean);
    }
    return await updateParkingAreaRepo(id, parkingAreaData as unknown as ParkingAreaModel);
};
export const updateParkingAreaByOwnerId = async (ownerId: string, data: Partial<ParkingAreaModel>) => {

    await updateParkingAreaByOwnerIdRepo(ownerId, data);
    const parkingArea = await getParkingAreasByOwnerIdRepo(ownerId);
    const parkingAreaIds = parkingArea.map((item) => item._id as string);


    await updateParkingSlotStatus(parkingAreaIds as string[], data.isActive as boolean);
    return parkingArea;
};

export const deleteParkingArea = async (id: string) => {
    return await deleteParkingAreaRepo(id);
};

export const getParkingAreaById = async (id: string) => {
    return await getParkingAreaByIdRepo(id);
};

export const getAllParkingAreas = async (query: any) => {
    const { page = 1, limit = 9999 ,parkingOwner} = query;
    const filters:FilterQuery<ParkingAreaModel> = {};
    if(parkingOwner){
        filters.ownerId = new mongoose.Types.ObjectId(parkingOwner);
    }
    return await getAllParkingAreasRepo(filters, page, limit);
};

// export const getActiveParkingAreas = async () => {
//     return await getActiveParkingAreasRepo();
// };

export const getParkingAreasByOwnerId = async (ownerId: string) => {
    const parkingAreas = await getParkingAreasByOwnerIdRepo(ownerId);
    const parkingAreasWithSlots = await Promise.all(parkingAreas.map(async (parkingArea) => {
        const parkingSlots = await getSlotsByParkingAreaRepo(parkingArea._id as string);
        return { ...parkingArea, slots: parkingSlots };
    }));
    return parkingAreasWithSlots;
};
export const deleteParkingAreaByOwnerId = async (ownerId: string) => {
    const parkingAreas = await getParkingAreasByOwnerIdRepo(ownerId);
    if (parkingAreas.length === 0) {
        throw new Error("Parking area not found");
    }
    const parkingAreaIds = parkingAreas.map((parkingArea) => parkingArea._id as string);
    await ParkingSlotDTO.deleteMany({ parkingAreaId: { $in: parkingAreaIds } });
    await deleteParkingAreaByOwnerIdRepo(ownerId);

    return { status: true, message: 'Parking area deleted successfully' } as BaseResponse;
};

// export const getParkingAreaByLocation = async (longitude: number, latitude: number) => {
//   return await getParkingAreaByLocationRepo(longitude, latitude);
// };

export const checkDuplicateEntry = async (data: Partial<ParkingAreaModel>) => {
    const query: any = {}
    const arrayOfQuery = []
    if (data.contactNumber) {
        arrayOfQuery.push({ contactNumber: data.contactNumber })
    }
    if (data.email) {
        arrayOfQuery.push({ email: data.email })
    }
    if (arrayOfQuery.length > 0) {
        query.$or = arrayOfQuery
    }
    const parkingArea = await ParkingAreaDTO.find(query);
    if (parkingArea.length > 0) {
        const errorMessage: any = {}
        for (const item of parkingArea) {
            if (data.contactNumber && item.contactNumber === data.contactNumber) {
                errorMessage.contactNumber = 'Duplicate entry found'
            }
            if (data.email && item.email?.toLowerCase() === data.email?.toLowerCase()) {
                errorMessage.email = 'Duplicate entry found'
            }
        }

        return { status: false, message: 'Duplicate entry found', errorMessage } as BaseResponse;
    }
    return { status: true, message: 'No duplicate entry found' } as BaseResponse;
}

export const getNearestParkingSpots = async (coords: { lng: number, lat: number },radius:number=10000,slotFilterData:{vehicleType:string,startTime:Date,endTime?:Date}): Promise<ParkingAreaModel[]> => {
    const parkingAreas = await getActiveParkingAreasRepo(coords,radius)
   
    const parkingSlots = await filterParkingSlots(slotFilterData,parkingAreas);
    const refinedParkingSlots = parkingSlots.map((item) => {
        delete item.slots;
        return item;
    });
    return refinedParkingSlots;
}