import { NextFunction, Request, Response } from 'express';
import Chamber from '../models/Chamber';
import CustomError from '../../utils/CustomError';
import { Types, Schema } from 'mongoose';
import { z } from 'zod';
import { ZodErrorType } from '../../types';
import formatZodValidationError from '../../helpers/formatZodValidationError';
import District from '../models/District';
import Area from '../models/Area';
import {
    IRequestUser,
    IRequestWithUser,
} from '../../interfaces/authInterfaces';
import UserService from '../services/UserService';
import { IAssistant, IChamber, IDoctor } from '../../interfaces/userInterfaces';
import { IArea, IDistrict } from '../../interfaces/areaInterfaces';
import User from '../models/User';
import { name } from 'ejs';
import DoctorService from '../services/DoctorService';

const chamberHandlers = {
    getChambers: async (
        request: IRequestWithUser,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            if (!request?.user) {
                return next(new CustomError(401, 'Unauthorized'));
            }

            // get user
            const user: IRequestUser = request?.user;
            const userId = user.id;

            if (user.role == 2) {
                // the user is a doctor
                const doctorService = new DoctorService();
                const doctor: IDoctor | null = await doctorService.getDoctor(
                    userId
                );

                if (!doctor) {
                    return next(new CustomError(403, 'Forbidden'));
                }

                const chambers: IChamber[] = doctor.chambers;
                return response.status(200).json({
                    success: true,
                    data: { chambers },
                });
            } else if (user.role == 3) {
                // the user is an assistant
                const assistant: IAssistant | null = await User.findById(
                    userId
                );

                if (!assistant) {
                    return next(new CustomError(403, 'Forbidden'));
                }

                const chambers: IChamber[] = await Chamber.find({
                    _id: { $in: assistant.assignedChamber },
                    active: true,
                });
                return response.status(200).json({
                    success: true,
                    data: { chambers },
                });
            } else {
                return next(new CustomError(403, 'Forbidden'));
            }
        } catch (error: any) {
            console.log(error);
            return next(new CustomError(500, error));
        }
    },

    getChamber: async (
        request: IRequestWithUser,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            // params id validation
            const { id } = request.params;
            if (!id) {
                return next(new CustomError(422, 'Chamber id is required'));
            }
            if (!Types.ObjectId.isValid(id)) {
                return next(new CustomError(404, 'Chamber not found'));
            }
            if (!request?.user) {
                return next(new CustomError(401, 'Unauthorized'));
            }

            // get chamber
            const doctorService = new DoctorService();
            const chamber: IChamber | null = await Chamber.findById(id);
            if (!chamber) {
                return next(new CustomError(404, 'Chamber not found'));
            }

            // get user and validate that the user has access to this chamber
            const user: IRequestUser = request?.user;
            if (user.role == 2) {
                // doctor
                if (chamber.doctorId.toString() != user.id.toString()) {
                    return next(new CustomError(403, 'Forbidden'));
                }
            } else if (user.role == 3) {
                // assistant
                const assistant: IAssistant | null = await User.findById(
                    user.id
                );
                if (
                    assistant &&
                    assistant.assignedChamber &&
                    assistant.assignedChamber.toString() !=
                        chamber._id.toString()
                ) {
                    return next(new CustomError(403, 'Forbidden'));
                }
            }

            return response.status(200).json({
                success: true,
                data: { chamber },
            });
        } catch (error: any) {
            console.log(error);
            return next(new CustomError(500, error));
        }
    },

    createChamber: async (
        request: IRequestWithUser,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        // body
        /* {
            name: string
            address: string
            district: string
            areas: string[]
        } */

        try {
            const schema = z.object({
                name: z
                    .string({
                        required_error: 'Name is required',
                        invalid_type_error: 'Name must be a string',
                    })
                    .trim()
                    .min(1, { message: 'Name cannot be empty' })
                    .max(255),
                address: z
                    .string({
                        required_error: 'Address is required',
                        invalid_type_error: 'Address must be a string',
                    })
                    .trim()
                    .min(1, { message: 'Address cannot be empty' })
                    .max(255),
                areaId: z
                    .string({
                        required_error: 'Area ID is required',
                        invalid_type_error: 'Area ID must be a string',
                    })
                    .trim()
                    .min(1, { message: 'Area ID cannot be empty' })
                    .max(255),
                districtId: z
                    .string({
                        required_error: 'District ID is required',
                        invalid_type_error: 'District ID must be a string',
                    })
                    .trim()
                    .min(1, { message: 'District ID cannot be empty' })
                    .max(255),
                contact: z
                    .string({
                        required_error: 'Contact is required',
                        invalid_type_error: 'Contact must be a string',
                    })
                    .trim()
                    .regex(/^\+?\d+$/, {
                        message:
                            'Contact should start with a plus sign (+) and contain only digits',
                    })
                    .min(10, {
                        message:
                            'Contact should be at least 10 characters, starting with a plus sign (+)',
                    })
                    .max(15, {
                        message:
                            'Contact should be at most 15 characters, starting with a plus sign (+)',
                    }),
            });

            const parsedData = schema.safeParse(request.body);
            console.log(parsedData);
            if (!parsedData.success) {
                const errors: ZodErrorType = formatZodValidationError(
                    parsedData.error
                );
                return next(new CustomError(422, errors));
            }

            // check if doctor exists and active
            const doctorId: string | undefined = request.user?.id;
            console.log('doctor id', doctorId);
            if (!doctorId) {
                return next(new CustomError(401, 'Unauthorized'));
            }
            if (!Types.ObjectId.isValid(doctorId)) {
                return next(new CustomError(404, 'Doctor not found'));
            }
            const doctorService = new DoctorService();
            const existingDoctor: IDoctor | null =
                await doctorService.getDoctor(doctorId);
            console.log('existing doctor', existingDoctor);
            if (!existingDoctor || !existingDoctor.active) {
                return next(new CustomError(404, 'Doctor not found 2'));
            }

            // check if district exists
            if (!Types.ObjectId.isValid(request.body.districtId)) {
                return next(new CustomError(404, 'District not found'));
            }
            const existingDistrict: IDistrict | null = await District.findById(
                request.body.districtId
            );
            if (!existingDistrict) {
                return next(new CustomError(404, 'District not found'));
            }

            // check if area exists and belongs to district
            if (!Types.ObjectId.isValid(request.body.areaId)) {
                return next(new CustomError(404, 'Area not found'));
            }
            const existingArea: IArea | null = await Area.findById(
                request.body.areaId
            );
            if (
                !existingArea ||
                existingArea.districtId.toString() !== request.body.districtId
            ) {
                return next(new CustomError(404, 'Area not found'));
            }

            const requestData = request.body;
            requestData['doctorId'] = doctorId;

            const chamber = new Chamber(requestData);
            // chamber.doctorId = new Types.ObjectId(doctorId);
            await chamber.save();

            return response.status(201).json({
                success: true,
                data: { chamber },
            });
        } catch (error: any) {
            console.log(error);
            return next(new CustomError(500, error));
        }
    },

    updateChamber: async (
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        // body
        /*
        {"_id":"65f6d13ac11a15642b0f94ae","doctorId":"65f6d13ac11a15642b0f94ad","name":"Oasis Hospital","address":"Subhanighat, Sylhet","areaId":"65f58837fc102bdf67f3d2fc","districtId":"65f58154fc102bdf67f3d285","visitingHours":{"saturday":{"start":"17:00","end":"21:00"},"sunday":{"start":"17:00","end":"21:00"},"monday":{"start":"17:00","end":"21:00"},"tuesday":{"start":"17:00","end":"21:00"},"wednesday":{"start":"17:00","end":"21:00"},"thursday":{"start":"17:00","end":"21:00"},"friday":{"start":"17:00","end":"21:00"},"_id":"665029e5a1f77b76323eb206"},"contact":"+8801701266679","active":true}
        */

        try {
            const chamberId = request.params.id;

            // Validate the chamberId
            if (!Types.ObjectId.isValid(chamberId)) {
                return next(new CustomError(404, 'Chamber not found'));
            }

            const schema = z.object({
                name: z
                    .string({
                        required_error: 'Name is required',
                        invalid_type_error: 'Name must be a string',
                    })
                    .trim()
                    .max(255),
                address: z
                    .string({
                        required_error: 'Address is required',
                        invalid_type_error: 'Address must be a string',
                    })
                    .trim()
                    .max(255),
                areaId: z
                    .string({
                        required_error: 'Area ID is required',
                        invalid_type_error: 'Area ID must be a string',
                    })
                    .trim()
                    .max(255),
                districtId: z
                    .string({
                        required_error: 'District ID is required',
                        invalid_type_error: 'District ID must be a string',
                    })
                    .trim()
                    .max(255),
                doctorId: z
                    .string({
                        required_error: 'Doctor ID is required',
                        invalid_type_error: 'Doctor ID must be a string',
                    })
                    .trim()
                    .max(255),
            });

            const parsedData = schema.safeParse(request.body);
            if (!parsedData.success) {
                const errors: ZodErrorType = formatZodValidationError(
                    parsedData.error
                );
                return next(new CustomError(422, errors));
            }

            // Find the chamber by ID
            const chamber = await Chamber.findById(chamberId);
            if (!chamber) {
                return next(new CustomError(404, 'Chamber not found'));
            }
            // check doctorId is valid
            if (!Types.ObjectId.isValid(request.body.doctorId)) {
                return next(new CustomError(400, 'Invalid doctor ID'));
            }

            if (
                chamber.doctorId.toString() !== request.body.doctorId.toString()
            ) {
                return next(new CustomError(403, 'Forbidden'));
            }

            // chamber is found
            const requestData = request.body;

            // check districtId is valid
            if (!(await District.findById(requestData.districtId))) {
                return next(new CustomError(400, 'Invalid district ID'));
            }
            // check areaId is valid
            const existingArea = await Area.findById(requestData.areaId);
            if (
                !existingArea ||
                existingArea.districtId.toString() !== requestData.districtId
            ) {
                return next(new CustomError(400, 'Invalid area ID'));
            }

            // Update the chamber with the new data
            // chamber.doctorId = requestData.doctorId;
            chamber.name = requestData.name;
            chamber.address = requestData.address;
            chamber.areaId = requestData.areaId;
            chamber.districtId = requestData.districtId;
            chamber.visitingHours = requestData.visitingHours;
            chamber.contact = requestData.contact;
            chamber.active = requestData.active;

            // Save the updated chamber
            await chamber.save();

            return response.status(200).json({
                success: true,
                data: { chamber },
            });
        } catch (error: any) {
            return next(new CustomError(500, 'Something went wrong'));
        }
    },

    myChamber: async (
        request: IRequestWithUser,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const assistant: IAssistant | null = await User.findById(
                request?.user?.id
            );

            const chamber: IChamber | null = await Chamber.findById(
                assistant?.assignedChamber
            );

            return response.status(200).json({
                success: true,
                data: {
                    chamber: {
                        id: chamber?._id,
                        name: chamber?.name,
                    },
                },
            });
        } catch (error: any) {
            return next(new CustomError(500, 'Something went wrong'));
        }
    },
};

export default chamberHandlers;
