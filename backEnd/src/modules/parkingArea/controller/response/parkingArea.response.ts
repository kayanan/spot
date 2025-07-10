import {
    BaseResponse,
    CountResponse,
  } from '../../../base/controller/responses/base.repsonse';
  import { ParkingAreaModel } from '@/modules/parkingArea/data/dtos/parkingArea.dto';
  
  export interface ParkingAreaListResponse extends CountResponse {
    total?: number;
    parkingAreas: Array<ParkingAreaModel>;
  }
  
  export interface ParkingAreaResponse extends BaseResponse {
    parkingArea: ParkingAreaModel;
  }
  