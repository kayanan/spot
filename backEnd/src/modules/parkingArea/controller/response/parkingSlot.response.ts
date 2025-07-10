import {
    BaseResponse,
    CountResponse,
  } from '../../../base/controller/responses/base.repsonse';
  import { ParkingSlotModel } from '@/modules/parkingArea/data/dtos/parkingSlot.dto';
  
  export interface ParkingSlotListResponse extends CountResponse {
    total?: number;
    parkingSlots: Array<ParkingSlotModel>;
  }
  
  export interface ParkingSlotResponse extends BaseResponse {
    parkingSlot: ParkingSlotModel;
  }
  