import { Document, Model, Mongoose, Schema } from 'mongoose';
import Database from '../../configs/Database';
import CustomError from '../../utils/CustomError';
import { IAppointment } from '../../interfaces/appointmentInterfaces';

let db: Mongoose;

try {
    db = Database.getInstance();
} catch (error: any) {
    throw new CustomError(500, error.message);
}

const collectionName = 'appointments';
let Appointment: Model<IAppointment & Document>;

try {
    const schema = new Schema<IAppointment>(
        {
            doctorId: {
                type: Schema.Types.ObjectId,
                ref: 'users', // Assuming the reference to the doctor collection is 'users'
                required: true,
            },
            chamberId: {
                type: Schema.Types.ObjectId,
                ref: 'chambers', // Assuming the reference to the chamber collection is 'chambers'
                required: true,
            },
            patientName: {
                type: String,
                required: true,
            },
            patientEmail: {
                type: String,
                required: true,
            },
            date: {
                type: Date,
                required: true,
            },
            weekday: {
                type: String,
                required: true,
            },
            time: {
                type: String,
                required: true,
            },
            verificationCode: {
                type: String,
                required: false,
                default: '',
            },
            serialNo: {
                type: Number,
                required: true,
            },
            status: {
                type: String,
                required: true,
            },
        },
        { timestamps: true }
    );

    Appointment =
        db.models[collectionName] ||
        db.model<IAppointment & Document>(collectionName, schema);
} catch (error: any) {
    throw new CustomError(500, error.message);
}

export default Appointment;
