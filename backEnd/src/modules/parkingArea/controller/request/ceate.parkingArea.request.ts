
import { ObjectId } from "mongoose";
export interface CreateUpdateParkingAreaRequest {
    id?: String | ObjectId;
    name: string;
    location: {
        type: string;
        coordinates: number[];
    };
    ownerId: string | ObjectId;
    contactNumber: string;
    email: string;
    images: string[];
    description: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    district: string;
    province: string;
    postalCode: string;
    fee: number;
    isActive: boolean;
    isDeleted: boolean;
   
  
  }
  
  export interface ParkingAreaListRequest {
    search?: string;
    skip?: number;
    limit?: number;
  }