export interface IDistrict {
    value: string;
    label: string;
}

export interface IArea {
    value: string;
    label: string;
}

export interface IDistrictOption extends IDistrict {
    id: string;
}

export interface IAreaOption extends IArea {
    id: string;
}

export interface ISpecialization {
    value: string;
    label: string;
}

export interface IIndexFilters {
    name: string;
    district: string;
    areas: string[];
    specializations: string[];
    page: number;
    limit: number;
    available: boolean;
    sortBy: string;
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

export interface IChamber {
    _id: string;
    name: string;
    doctorId: string;
    areaId: string;
    districtId: string;
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

export interface IUser {
    name: string;
    email: string;
    phone?: string;
    role: number;
    education?: string;
    experience?: IExperience;
    specializations?: string[];
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IAssistant {
    _id: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
    assignedChamber: string;
    assignedChamberName: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IDoctor {
    _id: string;
    name: string;
    education: string;
    specializations: string[];
    experience: IExperience;
    chambers: IChamber[];
}

export interface IAppointment {
    _id: string;
    doctorId: string;
    chamberId: string;
    patientName: string;
    patientEmail: string;
    date: string;
    weekday: string;
    time: string;
    verificationCode: string;
    serialNo: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface IDashboardData {
    totalAppointments: number;
    totalChambers: number;
    totalAppointmentsToday: number;
    totalAppointmentsThisWeek: number;
    totalAppointmentsThisMonth: number;
    totalAppointmentsThisYear: number;
    totalAppointmentsThisYearByMonth: number[];
    totalPatients: number;
    totalDoctors: number;
    totalAssistants: number;
    todaysAppointments: any[];
    chamberWiseAppointmentsCount: any[];
    doctorWiseAppointmentsCount: any[];
}
