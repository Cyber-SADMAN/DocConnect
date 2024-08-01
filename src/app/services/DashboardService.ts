/**
 * Dashboard:
==========

Tiles:
------
* Total appointments {admin will count all, doctor will count appointment of his chambers, and assistant will count only his assigned chamber appointments} ([admin, doctor, assistant])
* Total patients {only consider unique emails from appointments collection; admin will count all, doctor will count patient of his chamber's associated appointments, and assistant will count only his assigned chamber appointments} ([admin, doctor, assistant])
* Total assistants ([doctor])
* Total doctors ([admin])
* Today's appointments ([doctor, assistant])

Tables:
-------
* Today's appointments {patient name, patient email, chamber name searial no, nb: in case of } ([doctor, assistant])
* Chamber-wise appointments count {chamber name, address, appointment_count} ([doctor])
* Doctor-wise appointments count {doctor name, } ([admin])
 */

import { Types } from 'mongoose';
import {
    IChamber,
    IAssistant,
    IUser,
    IDoctor,
} from '../../interfaces/userInterfaces';
import CustomError from '../../utils/CustomError';
import Appointment from '../models/Appointment';
import User from '../models/User';
import DoctorService from './DoctorService';
import { endOfToday, startOfToday } from 'date-fns';
import Chamber from '../models/Chamber';

export interface IDoctorWiseAppointmentsCount {
    doctorName: string;
    appointmentCount: number;
}

export interface IChamberWiseAppointmentsCount {
    chamberName: string;
    address: string;
    appointmentCount: number;
}

class DashboardService {
    async getTotalAppointments(user: IUser): Promise<number> {
        try {
            if (user.role === 1) {
                // Admin
                return await Appointment.countDocuments();
            } else if (user.role === 2) {
                // Doctor
                const doctorService = new DoctorService();

                const doctor: IDoctor | null = await doctorService.getDoctor(
                    user.id
                );
                if (!doctor || !doctor.chambers) {
                    throw new CustomError(403, 'Forbidden');
                }

                const chamberIds: string[] = doctor?.chambers.map(
                    (chamber: IChamber) => chamber._id
                );

                return await Appointment.countDocuments({
                    chamberId: { $in: chamberIds },
                });
            } else if (user.role === 3) {
                // Assistant
                const assistant: IAssistant | null = await User.findById(
                    user.id
                );
                if (!assistant || !assistant.assignedChamber) {
                    throw new CustomError(403, 'Forbidden');
                }

                return await Appointment.countDocuments({
                    chamberId: assistant.assignedChamber,
                });
            } else {
                throw new CustomError(403, 'Forbidden');
            }
        } catch (error: any) {
            throw new CustomError(500, error.message);
        }
    }

    // Function to get total chambers, for doctor and admin
    async getTotalChambers(user: IUser): Promise<number> {
        if (user.role === 1) {
            // Admin
            const totalChambers = await Chamber.countDocuments();

            return totalChambers;
        } else if (user.role === 2) {
            // Doctor
            const totalChambers = await Chamber.countDocuments({
                doctorId: new Types.ObjectId(user.id),
            });

            return totalChambers;
        } else {
            throw new CustomError(403, 'Forbidden');
        }
    }

    // Function to get total patients
    async getTotalPatients(user: IUser): Promise<number> {
        if (user.role === 1) {
            // Admin
            const patients: string[] = await Appointment.distinct(
                'patientEmail'
            );
            return patients.length;
        } else if (user.role === 2) {
            // Doctor
            const doctor: IDoctor | null = await new DoctorService().getDoctor(
                user.id
            );
            if (!doctor) throw new CustomError(403, 'Forbidden');

            const chamberIds: string[] = doctor?.chambers.map(
                (chamber: IChamber) => chamber._id
            );
            const patients: string[] = await Appointment.distinct(
                'patientEmail',
                {
                    chamberId: { $in: chamberIds },
                }
            );
            return patients.length;
        } else if (user.role === 3) {
            // Assistant
            const assistant: IAssistant | null = await User.findById(user.id);
            if (!assistant) throw new CustomError(403, 'Forbidden');

            const patients: string[] = await Appointment.distinct(
                'patientEmail',
                {
                    chamber: assistant.assignedChamber,
                }
            );
            return patients.length;
        } else {
            throw new CustomError(403, 'Forbidden');
        }
    }

    // Function to get total assistants (for doctors)
    async getTotalAssistants(user: IUser): Promise<number> {
        if (user.role !== 2) throw new CustomError(403, 'Forbidden');
        const doctor: IDoctor | null = await new DoctorService().getDoctor(
            user.id
        );
        if (!doctor) throw new CustomError(403, 'Forbidden');

        const chamberIds: string[] = doctor?.chambers.map(
            (chamber: IChamber) => chamber._id
        );
        const assistantsCount: number = await User.countDocuments({
            role: 3,
            assignedChamber: { $in: chamberIds },
        });
        return assistantsCount;
    }

    // Function to get total doctors (for admin)
    async getTotalDoctors(user: IUser): Promise<number> {
        if (user.role !== 1) throw new CustomError(403, 'Forbidden');
        return await User.countDocuments({ role: 2 });
    }

    // Function to get today's appointments count
    getTodaysTotalAppointments = async (user: IUser) => {
        const startOfDay = startOfToday();
        const endOfDay = endOfToday();

        console.log('startOfDay', startOfDay, 'endOfDay', endOfDay);

        try {
            if (user.role === 2) {
                // Doctor role
                const results = await Appointment.aggregate([
                    {
                        $match: {
                            doctorId: new Types.ObjectId(user.id),
                            date: { $gte: startOfDay, $lte: endOfDay },
                        },
                    },
                    {
                        $lookup: {
                            from: 'chambers',
                            localField: 'chamberId',
                            foreignField: '_id',
                            as: 'chamberDetails',
                        },
                    },
                    { $unwind: '$chamberDetails' },
                    {
                        $project: {
                            _id: 0,
                            chamberName: '$chamberDetails.name',
                            patientName: '$patientName',
                            serialNo: '$serialNo',
                            patientEmail: '$patientEmail',
                        },
                    },
                ]);

                return results.length;
            } else if (user.role === 3) {
                // Assistant role
                const assistant = await User.findById(user.id);
                if (!assistant || !assistant.assignedChamber) {
                    throw new Error('Assistant has no assigned chamber.');
                }

                const results = await Appointment.aggregate([
                    {
                        $match: {
                            chamberId: new Types.ObjectId(
                                assistant.assignedChamber
                            ),
                            date: { $gte: startOfDay, $lte: endOfDay },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            patientName: '$patientName',
                            serialNo: '$serialNo',
                            patientEmail: '$patientEmail',
                        },
                    },
                ]);

                return results.length;
            } else {
                throw new Error('Invalid user role.');
            }
        } catch (error: any) {
            throw new CustomError(500, error.message);
        }
    };

    // Function to get today's appointments (for doctors and assistants)
    getTodaysAppointments = async (user: IUser) => {
        const startOfDay = startOfToday();
        const endOfDay = endOfToday();

        console.log('startOfDay', startOfDay, 'endOfDay', endOfDay);

        try {
            if (user.role === 2) {
                // Doctor role
                const results = await Appointment.aggregate([
                    {
                        $match: {
                            doctorId: new Types.ObjectId(user.id),
                            date: { $gte: startOfDay, $lte: endOfDay },
                        },
                    },
                    {
                        $lookup: {
                            from: 'chambers',
                            localField: 'chamberId',
                            foreignField: '_id',
                            as: 'chamberDetails',
                        },
                    },
                    { $unwind: '$chamberDetails' },
                    {
                        $project: {
                            _id: 0,
                            chamberName: '$chamberDetails.name',
                            patientName: '$patientName',
                            serialNo: '$serialNo',
                            patientEmail: '$patientEmail',
                        },
                    },
                    { $sort: { serialNo: 1 } },
                    { $limit: 7 },
                ]);

                return results;
            } else if (user.role === 3) {
                // Assistant role
                const assistant = await User.findById(user.id);
                if (!assistant || !assistant.assignedChamber) {
                    throw new Error('Assistant has no assigned chamber.');
                }

                const results = await Appointment.aggregate([
                    {
                        $match: {
                            chamberId: new Types.ObjectId(
                                assistant.assignedChamber
                            ),
                            date: { $gte: startOfDay, $lte: endOfDay },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            patientName: '$patientName',
                            serialNo: '$serialNo',
                            patientEmail: '$patientEmail',
                        },
                    },
                    { $sort: { serialNo: 1 } },
                    { $limit: 7 },
                ]);

                return results;
            } else {
                throw new Error('Invalid user role.');
            }
        } catch (error: any) {
            throw new CustomError(500, error.message);
        }
    };

    // Function to get chamber-wise appointments count (for doctors)
    async getChamberWiseAppointmentsCount(
        user: IUser
    ): Promise<IChamberWiseAppointmentsCount[]> {
        if (user.role !== 2) throw new CustomError(403, 'Forbidden');

        const result: IChamberWiseAppointmentsCount[] =
            await Appointment.aggregate([
                { $match: { doctorId: new Types.ObjectId(user.id) } }, // Filter by doctorId
                {
                    $group: {
                        _id: '$chamberId',
                        appointmentCount: { $sum: 1 },
                    },
                },
                {
                    $lookup: {
                        from: 'chambers',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'chamberDetails',
                    },
                },
                { $unwind: '$chamberDetails' },
                {
                    $project: {
                        _id: 0,
                        chamberName: '$chamberDetails.name',
                        address: '$chamberDetails.address',
                        appointmentCount: 1,
                    },
                },
                { $sort: { appointmentCount: -1 } },
                { $limit: 7 }, // Sort by appointmentCount in descending order
            ]);
        return result;
    }

    // Function to get doctor-wise appointments count (for admin)
    async getDoctorWiseAppointmentsCount(
        user: IUser
    ): Promise<IDoctorWiseAppointmentsCount[]> {
        if (user.role !== 1) {
            throw new CustomError(403, 'Forbidden');
        }
        const result: IDoctorWiseAppointmentsCount[] =
            await Appointment.aggregate([
                {
                    $group: {
                        _id: '$doctorId',
                        appointmentCount: { $sum: 1 },
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'doctor',
                    },
                },
                {
                    $unwind: '$doctor',
                },
                {
                    $match: {
                        'doctor.role': 2,
                    },
                },
                {
                    $project: {
                        doctorName: '$doctor.name',
                        appointmentCount: 1,
                        _id: 0,
                    },
                },
                {
                    $sort: { appointmentCount: -1 },
                },
                {
                    $limit: 7,
                },
            ]);
        return result;
    }
}

export default DashboardService;
