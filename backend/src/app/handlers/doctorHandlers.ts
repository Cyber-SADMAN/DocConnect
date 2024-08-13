import { Request, Response, NextFunction } from 'express';
import CustomError from '../../utils/CustomError';
import { specializations } from '../../utils/data';
import { IDoctor } from '../../interfaces/userInterfaces';
import { Types } from 'mongoose';
import DoctorService from '../services/DoctorService';

interface ISearchDoctorsQuery {
    name?: string;
    areas?: string[];
    district?: string;
    specializations?: string[];
}

const doctorHandlers = {
    getDoctors: async (
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { name, areas, district, specializations } =
                request.query as ISearchDoctorsQuery;

            const doctorService = new DoctorService();
            const doctors: IDoctor[] = await doctorService.getAllDoctors(
                name ? name : null,
                district ? district : null,
                areas ? areas : [],
                specializations ? specializations : []
            );

            return response.status(200).json({
                success: true,
                data: { doctors },
            });
        } catch (error: any) {
            return next(new CustomError(500, 'Something went wrong'));
        }
    },

    getDoctor: async (
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const { id } = request.params;

            if (!id) {
                return next(new CustomError(400, 'Doctor id is required'));
            }

            if (!Types.ObjectId.isValid(id)) {
                return next(new CustomError(404, 'Doctor not found'));
            }
            const doctorService = new DoctorService();
            const doctor: IDoctor | null = await doctorService.getDoctor(id);

            if (!doctor) {
                return next(new CustomError(404, 'Doctor not found'));
            }

            const bookedAppointmentsCount =
                await doctorService.getAppointmentCounts(doctor.chambers);

            return response.status(200).json({
                success: true,
                data: { doctor, bookedAppointmentsCount },
            });
        } catch (error: any) {
            return next(new CustomError(500, 'Something went wrong'));
        }
    },

    getDoctorSpecializations: async (
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            return response.status(200).json({
                success: true,
                data: { specializations: [...new Set(specializations)] },
            });
        } catch (error: any) {
            return next(new CustomError(500, 'Something went wrong'));
        }
    },
};

export default doctorHandlers;
