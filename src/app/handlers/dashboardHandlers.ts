import { Response, NextFunction } from 'express';
import DashboardService from '../services/DashboardService';
import {
    IRequestWithUser,
    IRequestUser,
} from '../../interfaces/authInterfaces';
import CustomError from '../../utils/CustomError';
import { IUser } from '../../interfaces/userInterfaces';
import User from '../models/User';

export const getDashboardData = async (
    request: IRequestWithUser,
    response: Response,
    next: NextFunction
) => {
    try {
        if (!request?.user) {
            return next(new CustomError(401, 'Unauthorized'));
        }

        const dashboardService = new DashboardService();

        const user: IUser | null = await User.findById(request.user.id);

        if (!user) {
            return next(new CustomError(401, 'Unauthorized'));
        }

        const dashboardData: any = {};

        if (user.role === 1) {
            // Admin
            dashboardData.totalAppointments =
                await dashboardService.getTotalAppointments(user);
            dashboardData.totalPatients =
                await dashboardService.getTotalPatients(user);
            dashboardData.totalDoctors = await dashboardService.getTotalDoctors(
                user
            );
            dashboardData.totalChambers =
                await dashboardService.getTotalChambers(user);
            dashboardData.doctorWiseAppointmentsCount =
                await dashboardService.getDoctorWiseAppointmentsCount(user);
        } else if (user.role === 2) {
            // Doctor
            dashboardData.totalAppointments =
                await dashboardService.getTotalAppointments(user);
            dashboardData.totalChambers =
                await dashboardService.getTotalChambers(user);
            dashboardData.totalPatients =
                await dashboardService.getTotalPatients(user);
            dashboardData.totalAssistants =
                await dashboardService.getTotalAssistants(user);
            dashboardData.totalAppointmentsToday =
                await dashboardService.getTodaysTotalAppointments(user);
            dashboardData.todaysAppointments =
                await dashboardService.getTodaysAppointments(user);
            dashboardData.chamberWiseAppointmentsCount =
                await dashboardService.getChamberWiseAppointmentsCount(user);
        } else if (user.role === 3) {
            // Assistant
            dashboardData.totalAppointments =
                await dashboardService.getTotalAppointments(user);
            dashboardData.totalPatients =
                await dashboardService.getTotalPatients(user);
            dashboardData.totalAppointmentsToday =
                await dashboardService.getTodaysTotalAppointments(user);
            dashboardData.todaysAppointments =
                await dashboardService.getTodaysAppointments(user);
        } else {
            return next(new CustomError(403, 'Forbidden'));
        }

        return response.status(200).json({
            success: true,
            data: dashboardData,
        });
    } catch (error: any) {
        console.log(error);
        return next(new CustomError(500, error));
    }
};

export default getDashboardData;
