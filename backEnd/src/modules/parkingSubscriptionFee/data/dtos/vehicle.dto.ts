import { ObjectId, Schema, model } from "mongoose";
import { BaseDTO } from "../../../base/data/dtos/base.dto";

export interface VehicleModel extends BaseDTO {
  vehicleType: string;
  isDeleted:boolean;
  createdBy:ObjectId;
}

const VehicleSchema = new Schema<VehicleModel>(
  {
    vehicleType: { type: String, required: true ,toLowerCase:true,trim:true, validate: {
        validator: function(v:string){
            return /^[a-zA-Z]+$/.test(v);
        },
        message: "Vehicle type must be alphabetic"
    }},
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true }
);

VehicleSchema.pre('save', async function (next) {    
    const existingVehicle = await VehicleDTO.findOne({
        vehicleType: this.vehicleType,
    });
    if(existingVehicle){
        throw new Error('Vehicle already exists for this vehicle type');
    }
  next();
});
export const VehicleDTO = model<VehicleModel>("Vehicle", VehicleSchema);
