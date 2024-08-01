import { IArea, IDistrict } from './areaInterfaces';
import { Document, ObjectId } from 'mongoose';

export interface IExperience {
    title: string;
    institute: string;
    address: string;
}

export interface IVisitingHour {
    start: string;
    end: string;
    noOfSlots: number;
}

export interface IVisitingHours {
    [key: string]: IVisitingHour;
    saturday: IVisitingHour;
    sunday: IVisitingHour;
    monday: IVisitingHour;
    tuesday: IVisitingHour;
    wednesday: IVisitingHour;
    thursday: IVisitingHour;
    friday: IVisitingHour;
}

export interface IChamber extends Document {
    name: string;
    doctorId: ObjectId;
    areaId: ObjectId;
    districtId: ObjectId;
    address: string;
    visitingHours: IVisitingHours;
    contact: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IExperience {
    title: string;
    institute: string;
    address: string;
}

export interface IUser extends Document {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    role: number;
    assignedChamber?: string;
    education?: string;
    experience?: IExperience;
    specializations?: string[];
    chambers?: IChamber[];
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IAssistant extends IUser {
    assignedChamberName?: string;
}

export interface IChamberWithAreaAndDistrict extends IChamber {
    area: IArea;
    district: IDistrict;
}

export interface IDoctor extends IUser {
    chambers: IChamberWithAreaAndDistrict[];
}
