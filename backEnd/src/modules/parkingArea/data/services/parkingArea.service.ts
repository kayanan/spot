import { ParkingAreaModel, ParkingAreaDTO } from '../dtos/parkingArea.dto';
import mongoose, { Schema } from 'mongoose';

export interface CreateUpdateParkingAreaRequest {
    name: string;
    latitude: number;
    longitude: number;
    address: {
        line1: string;
        line2: string;
        city: string;
        district: string;
        province: string;
        postalCode: string;
    };
    contactNumber: string;
    email: string;
    images: string[];
    description: string;
    ownerId: string;
}

export class ParkingAreaService {
    async createParkingArea(request: CreateUpdateParkingAreaRequest): Promise<ParkingAreaModel> {
        const parkingArea = {
            name: request.name,
            location: {
                type: 'Point' as const,
                coordinates: [request.longitude, request.latitude]
            },
            ownerId: new mongoose.Types.ObjectId(request.ownerId),
            contactNumber: request.contactNumber,
            email: request.email,
            images: request.images,
            description: request.description,
            address: {
                line1: request.address.line1,
                line2: request.address.line2,
                city: new mongoose.Types.ObjectId(request.address.city),
                district: new mongoose.Types.ObjectId(request.address.district),
                province: new mongoose.Types.ObjectId(request.address.province),
                postalCode: request.address.postalCode
            },
            isActive: true,
            isDeleted: false
        };

        const createdParkingArea = await ParkingAreaDTO.create(parkingArea);
        return createdParkingArea;
    }

    async updateParkingArea(id: string, request: CreateUpdateParkingAreaRequest): Promise<ParkingAreaModel | null> {
        const updateData = {
            name: request.name,
            location: {
                type: 'Point' as const,
                coordinates: [request.longitude, request.latitude]
            },
            ownerId: new mongoose.Types.ObjectId(request.ownerId),
            contactNumber: request.contactNumber,
            email: request.email,
            images: request.images,
            description: request.description,
            address: {
                line1: request.address.line1,
                line2: request.address.line2,
                city: new mongoose.Types.ObjectId(request.address.city),
                district: new mongoose.Types.ObjectId(request.address.district),
                province: new mongoose.Types.ObjectId(request.address.province),
                postalCode: request.address.postalCode
            }
        };

        const updatedParkingArea = await ParkingAreaDTO.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        return updatedParkingArea;
    }
} 