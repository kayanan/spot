export interface CreateUpdateParkingSlotRequest {
    id?: String;
    parkingAreaId: string;
    slotNumber: number;
    slotType: string;
    slotPrice: number;
    slotDescription: string;
    slotImage: string;
    slotHeight: number;
    slotWidth: number;
    isActive: boolean;
    isDeleted: boolean;
    reservationId: string;
    isBooked: boolean;
    addReservationId: string;
    removeReservationId: string;
    isOccupied: boolean;

    
  }
  
  export interface ParkingSlotListRequest {
    parkingAreaId?:string;
    search?: string;
    skip?: number;
    limit?: number;
  }