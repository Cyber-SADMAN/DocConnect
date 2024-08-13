import { Document, ObjectId } from 'mongoose';

export interface IArea extends Document {
    name: string;
    districtId: ObjectId;
}

export interface IDistrict extends Document {
    name: string;
}
