import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import CustomError from '../../utils/CustomError';
import {
    IRequestUser,
    IRequestWithUser,
} from '../../interfaces/authInterfaces';
import { IAssistant, IDoctor, IUser } from '../../interfaces/userInterfaces';
import bcrypt from 'bcrypt';
import Hash from '../../utils/Hash';
import UserService from '../services/UserService';
import formatZodValidationError from '../../helpers/formatZodValidationError';
import { ZodErrorType } from '../../types';
import { z } from 'zod';
import { Types } from 'mongoose';
import DoctorService from '../services/DoctorService';

const assistantHandlers = {
    // Create a new assistant
    async create(
        request: IRequestWithUser,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const schema = z.object({
                name: z
                    .string({
                        required_error: 'Name is required',
                        invalid_type_error: 'Name must be a string',
                    })
                    .trim()
                    .max(255),
                email: z
                    .string({
                        required_error: 'Email is required',
                        invalid_type_error: 'Email must be a string',
                    })
                    .email({
                        message: 'Please enter a valid email address',
                    }),
                phoneNumber: z
                    .string({
                        required_error: 'Phone number is required',
                        invalid_type_error: 'Phone number must be a string',
                    })
                    .max(15, {
                        message: 'Phone number should be less than 15 digits',
                    }),
                password: z
                    .string({
                        required_error: 'Password is required',
                        invalid_type_error: 'Password must be a string',
                    })
                    .min(6, {
                        message:
                            'Password should be in between 6 and 10 characters',
                    })
                    .max(10, {
                        message:
                            'Password should be in between 6 and 10 characters',
                    }),
                assignedChamber: z.string({
                    required_error: 'Chamber is required',
                    invalid_type_error: 'Chamber must be a string',
                }),
            });

            // now parse and get all errors if false
            const parsedData = schema.safeParse(request.body);

            if (!parsedData.success) {
                const errors: ZodErrorType = formatZodValidationError(
                    parsedData.error
                );
                return next(new CustomError(422, errors));
            }

            if (!Types.ObjectId.isValid(parsedData.data.assignedChamber)) {
                return next(new CustomError(400, 'Chambber id is invalid'));
            }

            const _loggedInUser: IRequestUser | undefined = request?.user;
            if (!_loggedInUser) {
                return next(new CustomError(401, 'Unauthorized'));
            }
            const doctor: IDoctor | null = await new DoctorService().getDoctor(
                _loggedInUser.id
            );

            let assignedChamberIsValid = false;
            doctor?.chambers.forEach((chamber) => {
                if (
                    chamber._id.toString() === parsedData.data.assignedChamber
                ) {
                    assignedChamberIsValid = true;
                    return;
                }
            });

            if (!assignedChamberIsValid) {
                return next(new CustomError(400, 'Chamber id is invalid'));
            }

            const { name, email, phone, password, assignedChamber } =
                request.body;

            // initialize user service
            const userService = new UserService();

            // check if email already exists
            const existingUser = await userService.getUserByEmail(email);

            if (existingUser) {
                return next(new CustomError(409, 'The email is already taken'));
            }

            // hash the password
            const hashedPassword: string = await Hash.make(password);

            // create user
            const user: IUser | null = await User.create({
                name,
                email,
                phone,
                hashedPassword,
                role: 3,
                assignedChamber,
            });

            return response.status(201).json({
                success: true,
                message: 'Assistant created successfully',
                data: {
                    user,
                },
            });
        } catch (error: any) {
            return next(
                new CustomError(500, error.message || 'Internal server error')
            );
        }
    },

    // Get a single assistant by ID
    async get(
        request: IRequestWithUser,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const { id } = request.params;

            if (!id) {
                return next(new CustomError(422, 'Assistant id is required'));
            }

            if (!Types.ObjectId.isValid(id)) {
                return next(new CustomError(400, 'Assistant id is invalid'));
            }

            const assistant: IAssistant | null = await User.findById(id);
            if (!assistant || assistant.role !== 3) {
                return next(new CustomError(404, 'Assistant not found'));
            }

            return response.status(200).json({
                success: true,
                data: { assistant },
            });
        } catch (error: any) {
            return next(new CustomError(500, 'Something went wrong'));
        }
    },

    // Get all assistants
    async getAll(
        request: IRequestWithUser,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const _loggedInUser: IRequestUser | undefined = request?.user;
            if (!_loggedInUser) {
                return next(new CustomError(401, 'Unauthorized'));
            }
            const doctor: IDoctor | null = await new DoctorService().getDoctor(
                _loggedInUser.id
            );

            const chamberIds = doctor?.chambers.map((chamber) => chamber._id);

            const assistants: IAssistant[] = await User.find({
                role: 3,
                assignedChamber: { $in: chamberIds },
            }).lean();

            // IAssistant have a added 'assignedChamberName' field
            // assign the 'assignedChamberName' field with the 'name' of the corresponding 'chamber'
            assistants.forEach((assistant: IAssistant) => {
                const chamber = doctor?.chambers.find(
                    (chamber) =>
                        chamber._id.toString() ===
                        assistant.assignedChamber?.toString()
                );
                if (chamber) {
                    assistant.assignedChamberName = chamber.name;
                }
            });

            console.log('updated:', assistants);

            return response.status(200).json({
                success: true,
                data: { assistants },
            });
        } catch (error: any) {
            return next(
                new CustomError(500, error.message || 'Something went wrong')
            );
        }
    },

    // Update an existing assistant
    async update(
        request: IRequestWithUser,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const { id } = request.params;
            const { name, password, assignedChamber, active } = request.body;

            // Find the assistant
            const assistant: IAssistant | null = await User.findById(id);
            if (!assistant || assistant.role !== 3) {
                return next(new CustomError(404, 'Assistant not found'));
            }

            // Update fields (excluding email)
            if (name) assistant.name = name;
            if (password) assistant.password = await bcrypt.hash(password, 10);
            if (assignedChamber) assistant.assignedChamber = assignedChamber;
            assistant.active = active;

            await assistant.save();

            return response.status(200).json({
                success: true,
                data: assistant,
            });
        } catch (error: any) {
            return next(new CustomError(500, 'Something went wrong'));
        }
    },
};

export default assistantHandlers;
