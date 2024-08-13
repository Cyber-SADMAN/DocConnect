import { Document, Model, Mongoose, Schema } from 'mongoose';
import Database from '../../configs/Database';
import CustomError from '../../utils/CustomError';
import {
    IChamber,
    IVisitingHour,
    IVisitingHours,
} from '../../interfaces/userInterfaces';

let db: Mongoose;

try {
    db = Database.getInstance();
} catch (error: any) {
    throw new CustomError(500, error.message);
}

const collectionName = 'chambers';
let Chamber: Model<IChamber & Document>;

try {
    const visitingHourSchema = new Schema<IVisitingHour>(
        {
            start: { type: String },
            end: { type: String },
            noOfSlots: { type: Number, default: 0 },
        },
        { _id: false } // Disable the automatic creation of _id fields
    );

    const visitingHoursSchema = new Schema<IVisitingHours>(
        {
            saturday: {
                type: visitingHourSchema,
                default: { start: '', end: '' },
            },
            sunday: {
                type: visitingHourSchema,
                default: { start: '', end: '' },
            },
            monday: {
                type: visitingHourSchema,
                default: { start: '', end: '' },
            },
            tuesday: {
                type: visitingHourSchema,
                default: { start: '', end: '' },
            },
            wednesday: {
                type: visitingHourSchema,
                default: { start: '', end: '' },
            },
            thursday: {
                type: visitingHourSchema,
                default: { start: '', end: '' },
            },
            friday: {
                type: visitingHourSchema,
                default: { start: '', end: '' },
            },
        },
        { _id: false } // Disable the automatic creation of _id fields
    );

    const schema = new Schema<IChamber>(
        {
            name: {
                type: String,
                required: true,
            },
            doctorId: {
                type: Schema.Types.ObjectId, // Set type to Schema.Types.ObjectId
                ref: 'users', // Assuming the reference to the doctor collection is 'users'
                required: true,
            },
            areaId: {
                type: Schema.Types.ObjectId, // Set type to Schema.Types.ObjectId
                ref: 'areas', // Assuming the reference to the area collection is 'areas'
                required: true,
            },
            districtId: {
                type: Schema.Types.ObjectId, // Set type to Schema.Types.ObjectId
                ref: 'districts', // Assuming the reference to the district collection is 'districts'
                required: true,
            },
            address: {
                type: String,
                required: true,
            },
            visitingHours: {
                type: visitingHoursSchema,
                default: null, // Allow visitingHours to be null
            },
            contact: {
                type: String,
                required: true,
            },
            active: {
                type: Boolean,
                required: true,
                default: true,
            },
        },
        { timestamps: true }
    );

    Chamber =
        db.models[collectionName] ||
        db.model<IChamber & Document>(collectionName, schema);
} catch (error: any) {
    throw new CustomError(500, error.message);
}

export default Chamber;
