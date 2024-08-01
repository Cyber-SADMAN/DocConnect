import { Document, ObjectId } from 'mongoose';

export interface IAppointment extends Document {
    id: string;
    doctorId: ObjectId;
    chamberId: ObjectId;
    patientName: string;
    patientEmail: string;
    date: Date;
    weekday: string;
    time: string;
    verificationCode: string;
    serialNo: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

/**
    statuses = [
        'requested',
        'verified',
        'queued',
        'cancelled',
        'ongoing',
        'completed',
    ];
 */
