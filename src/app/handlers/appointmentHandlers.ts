import { Request, Response, NextFunction } from 'express';
import mongoose, { Types } from 'mongoose';
import z from 'zod';
import { format, parseISO, getDay } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import EmailService from '../services/EmailService';
import CustomError from '../../utils/CustomError';
import User from '../models/User';
import Chamber from '../models/Chamber';
import Appointment from '../models/Appointment';
import { IAppointment } from '../../interfaces/appointmentInterfaces';
import {
    IAssistant,
    IChamber,
    IDoctor,
    IUser,
    IVisitingHour,
    IVisitingHours,
} from '../../interfaces/userInterfaces';
import { ZodErrorType } from '../../types';
import formatZodValidationError from '../../helpers/formatZodValidationError';
import AppointmentService from '../services/AppointmetService';
import {
    IRequestUser,
    IRequestWithUser,
} from '../../interfaces/authInterfaces';
import UserService from '../services/UserService';
import DoctorService from '../services/DoctorService';

const appointmentHandlers = {
    async create(request: Request, response: Response, next: NextFunction) {
        try {
            const schema = z.object({
                patientEmail: z
                    .string()
                    .email({ message: 'Invalid email address' }),
                patientName: z
                    .string()
                    .min(1, { message: 'Patient name is required' }),
                doctorId: z
                    .string()
                    .min(1, { message: 'Doctor ID is required' }),
                chamberId: z
                    .string()
                    .min(1, { message: 'Chamber ID is required' }),
                date: z.string().min(1, { message: 'Date is required' }),
                weekday: z.string().min(1, { message: 'Weekday is required' }),
            });

            const parsedData = schema.safeParse(request.body);
            if (!parsedData.success) {
                const errors: ZodErrorType = formatZodValidationError(
                    parsedData.error
                );
                return next(new CustomError(422, errors));
            }

            const {
                patientEmail,
                patientName,
                doctorId,
                chamberId,
                date,
                weekday,
            } = parsedData.data;

            if (!mongoose.Types.ObjectId.isValid(doctorId)) {
                return next(new CustomError(400, 'Invalid Doctor ID'));
            }
            if (!mongoose.Types.ObjectId.isValid(chamberId)) {
                return next(new CustomError(400, 'Invalid Chamber ID'));
            }

            const doctor: IDoctor | null = await User.findOne({
                _id: doctorId,
                active: true,
            });
            if (!doctor) {
                return next(new CustomError(404, 'Doctor not found'));
            }

            const chamber: IChamber | null = await Chamber.findOne({
                _id: chamberId,
                active: true,
            });
            console.log('Chamber:', chamber);
            if (!chamber) {
                return next(new CustomError(404, 'Chamber not found'));
            }

            const bangladeshTimeZone = 'Asia/Dhaka';
            // Parse the date string as if it is in 'Asia/Dhaka' timezone
            const zonedDate = toZonedTime(parseISO(date), bangladeshTimeZone);
            // Convert the zoned date to UTC
            const appointmentDate = fromZonedTime(
                zonedDate,
                bangladeshTimeZone
            );

            console.log('Hello:', [zonedDate, appointmentDate]);

            const dayIndex = getDay(zonedDate); // 0 (Sunday) to 6 (Saturday)
            const weekDays = [
                'sunday',
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
            ];
            if (weekDays[dayIndex] !== weekday.toLowerCase()) {
                return next(
                    new CustomError(400, 'Weekday does not match the date')
                );
            }

            const existingAppointment: IAppointment | null =
                await Appointment.findOne({
                    doctorId,
                    chamberId,
                    patientEmail,
                    date: appointmentDate,
                });

            if (existingAppointment) {
                return next(
                    new CustomError(
                        409,
                        'An appointment is already created with this email today with the same doctor and chamber'
                    )
                );
            }

            const bookedAppointments: IAppointment[] = await Appointment.find({
                doctorId,
                chamberId,
                date: appointmentDate,
                status: { $in: ['verified', 'queued', 'ongoing', 'completed'] },
            }).sort({ time: 1 });

            if (bookedAppointments.length >= 15) {
                return next(
                    new CustomError(
                        400,
                        'Maximum appointment limit reached for the selected doctor and chamber on this date'
                    )
                );
            }

            const visitingHours: IVisitingHours = chamber.visitingHours;
            const todaysVisitingHour: IVisitingHour =
                visitingHours[weekday.toLowerCase()];

            if (
                !todaysVisitingHour ||
                !todaysVisitingHour.start ||
                !todaysVisitingHour.end
            ) {
                return next(
                    new CustomError(
                        400,
                        'No visiting hours defined for the selected day'
                    )
                );
            }

            const verificationCode: string =
                new AppointmentService().createVerificationCode();

            const appointment: IAppointment = new Appointment({
                patientEmail,
                patientName,
                doctorId,
                chamberId,
                date: appointmentDate,
                weekday,
                time: todaysVisitingHour.start,
                verificationCode,
                serialNo: bookedAppointments.length + 1,
                status: 'requested',
            });
            await appointment.save();

            const emailBody: string = await new Promise<string>(
                (resolve, reject) => {
                    response.render(
                        'otp-verification.html',
                        {
                            name: patientName,
                            doctor: doctor.name,
                            code: verificationCode,
                        },
                        (err, html) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(html);
                            }
                        }
                    );
                }
            );

            const emailService = new EmailService();
            await emailService.sendMail(
                [patientEmail],
                'Appointment Verification',
                emailBody
            );

            return response.status(201).json({
                success: true,
                message: 'Appointment created successfully',
                data: { appointment },
            });
        } catch (error: any) {
            console.error(error);
            next(error);
        }
    },

    async verifyCode(request: Request, response: Response, next: NextFunction) {
        try {
            const schema = z.object({
                code: z.string().length(8),
                currentTime: z
                    .string()
                    .min(1, { message: 'Current time is required' }),
                appointmentId: z
                    .string()
                    .min(1, { message: 'Appointment ID is required' }),
            });

            const parsedData = schema.safeParse(request.body);
            if (!parsedData.success) {
                const errors: ZodErrorType = formatZodValidationError(
                    parsedData.error
                );
                return next(new CustomError(422, errors));
            }

            const { code, currentTime, appointmentId } = parsedData.data;

            if (!Types.ObjectId.isValid(appointmentId)) {
                return next(new CustomError(400, 'Invalid appointment ID'));
            }

            const appointment: IAppointment | null = await Appointment.findOne({
                _id: appointmentId,
                verificationCode: code,
                status: 'requested',
            });
            if (!appointment) {
                return next(new CustomError(404, 'Appointment not found'));
            }

            // Parse currentTime to Date object
            const parsedCurrentTime = parseISO(currentTime);

            // Calculate the time difference in milliseconds
            const timeDiff = Math.abs(
                new Date(appointment.updatedAt).getTime() -
                    parsedCurrentTime.getTime()
            );

            console.log('timeDiff: ', timeDiff);

            if (timeDiff > 120000) {
                // 120000 milliseconds = 120 seconds = 2 minutes
                return next(new CustomError(400, 'Code expired'));
            }

            // Check the number of appointments on the same day
            const bookedAppointments: IAppointment[] = await Appointment.find({
                doctorId: appointment.doctorId,
                chamberId: appointment.chamberId,
                date: appointment.date, // Use the stored appointment date
                status: { $in: ['verified', 'queued', 'ongoing', 'completed'] },
            }).sort({ time: 1 });

            if (bookedAppointments.length >= 15) {
                return next(
                    new CustomError(
                        400,
                        'Maximum appointment limit reached for the selected doctor and chamber on this date'
                    )
                );
            }

            appointment.status = 'verified';
            await appointment.save();

            const doctor: IDoctor | null = await new DoctorService().getDoctor(
                appointment.doctorId.toString()
            );

            const emailBody = await new Promise<string>((resolve, reject) => {
                response.render(
                    'confirmation.html',
                    {
                        name: appointment.patientName,
                        doctor: doctor?.name,
                        appointmentDate: format(
                            new Date(appointment.date),
                            'dd LLL yyyy'
                        ),
                        appointmentTime: appointment.time,
                    },
                    (err, html) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(html);
                        }
                    }
                );
            });
            await new EmailService().sendMail(
                [appointment.patientEmail],
                'Appointment Confirmation',
                emailBody
            );

            return response.status(200).json({
                success: true,
                message: 'Code verified successfully',
                data: { appointment },
            });
        } catch (error: any) {
            console.error(error);
            next(error);
        }
    },

    async resendCode(request: Request, response: Response, next: NextFunction) {
        try {
            const { appointmentId } = request.body;
            if (!Types.ObjectId.isValid(appointmentId)) {
                return next(new CustomError(400, 'Invalid appointment id'));
            }

            const appointment: IAppointment | null = await Appointment.findOne({
                _id: appointmentId,
                status: 'requested',
            });
            if (!appointment) {
                return next(new CustomError(404, 'Appointment not found'));
            }

            const verificationCode: string =
                new AppointmentService().createVerificationCode();

            appointment.verificationCode = verificationCode;
            appointment.status = 'verified';
            await appointment.save();

            return response.status(200).json({
                success: true,
                message: 'Code resent successfully',
                data: { appointment },
            });
        } catch (error: any) {
            console.error(error);
            next(error);
        }
    },

    async getAll(
        request: IRequestWithUser,
        response: Response,
        next: NextFunction
    ) {
        try {
            const schema = z.object({
                startDate: z.string().optional(),
                endDate: z.string().optional(),
                chamberId: z.string().optional(),
                patientEmail: z.string().optional(),
                patientName: z.string().optional(),
                status: z.string().optional(),
            });

            const parsedData = schema.safeParse(request.query);
            if (!parsedData.success) {
                const errors: ZodErrorType = formatZodValidationError(
                    parsedData.error
                );
                return next(new CustomError(422, errors));
            }

            const {
                startDate,
                endDate,
                chamberId,
                patientEmail,
                patientName,
                status,
            } = parsedData.data;

            // Validate chamber ID (optional check)
            if (chamberId && !mongoose.Types.ObjectId.isValid(chamberId)) {
                return next(new CustomError(400, 'Invalid chamber id'));
            }

            // Define the timezone for Dhaka
            const bangladeshTimeZone = 'Asia/Dhaka';

            // Parse and convert startDate to UTC
            let startDateInUTC: Date | undefined;
            if (startDate) {
                const parsedStartDate = parseISO(startDate);
                startDateInUTC = toZonedTime(
                    parsedStartDate,
                    bangladeshTimeZone
                );
            }

            // Parse and convert endDate to UTC
            let endDateInUTC: Date | undefined;
            if (endDate) {
                const parsedEndDate = parseISO(endDate);
                endDateInUTC = toZonedTime(parsedEndDate, bangladeshTimeZone);
            }

            // Construct the MongoDB query based on the filters
            const query: any = {};

            if (startDateInUTC && endDateInUTC) {
                query.date = {
                    $gte: startDateInUTC,
                    $lte: endDateInUTC,
                };
            } else if (startDateInUTC) {
                query.date = { $gte: startDateInUTC };
            } else if (endDateInUTC) {
                query.date = { $lte: endDateInUTC };
            }

            if (chamberId) {
                query.chamberId = chamberId;
            }
            if (patientEmail) {
                query.patientEmail = { $regex: patientEmail, $options: 'i' };
            }
            if (patientName) {
                query.patientName = { $regex: patientName, $options: 'i' };
            }
            if (status) {
                query.status = status;
            }

            if (request?.user?.role == 3) {
                const assistant: IAssistant | null = await User.findById(
                    request?.user?.id
                );

                if (assistant) {
                    query.chamberId = assistant.assignedChamber;
                }
            }

            // Fetch appointments based on the constructed query
            const appointments = await Appointment.find(query);

            return response.status(200).json({
                success: true,
                data: { appointments },
            });
        } catch (error: any) {
            console.error(error);
            next(error);
        }
    },

    async updateStatus(
        request: IRequestWithUser,
        response: Response,
        next: NextFunction
    ) {
        try {
            const _loggedInUser: IRequestUser | undefined = request.user;
            if (!_loggedInUser) {
                return next(new CustomError(401, 'Unauthorized'));
            }

            const loggedInUser: IUser | null = await User.findOne({
                _id: _loggedInUser.id,
            });

            const appointmentId = request.params.id;

            if (!appointmentId) {
                return next(new CustomError(422, 'Appointment id is required'));
            }
            if (!Types.ObjectId.isValid(appointmentId)) {
                return next(new CustomError(400, 'Invalid appointment id'));
            }

            const appointment: IAppointment | null = await Appointment.findOne({
                _id: appointmentId,
            });
            if (!appointment) {
                return next(new CustomError(404, 'Appointment not found'));
            }

            const currentStatus: string = appointment?.status;

            const { cancel } = request.body;

            if (
                !['requested', 'verified', 'queued', 'ongoing'].includes(
                    currentStatus
                )
            ) {
                return next(new CustomError(422, 'Invalid status'));
            }

            console.log(currentStatus, cancel, loggedInUser?.role);

            if (currentStatus == 'requested') {
                appointment.status = cancel == 1 ? 'cancelled' : 'verified';
            } else if (currentStatus == 'verified') {
                appointment.status = cancel == 1 ? 'cancelled' : 'queued';
            } else if (currentStatus == 'queued') {
                appointment.status = cancel == 1 ? 'cancelled' : 'ongoing';
            } else if (currentStatus == 'ongoing' && loggedInUser?.role == 2) {
                appointment.status = cancel == 1 ? 'cancelled' : 'completed';
            }

            await appointment.save();
            return response.status(200).json({
                success: true,
                data: { appointment },
            });
        } catch (error: any) {
            console.error(error);
            next(error);
        }
    },
};

export default appointmentHandlers;
