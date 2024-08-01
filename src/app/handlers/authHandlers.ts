import { Response, Request } from 'express';
import z from 'zod';
import CustomError from '../../utils/CustomError';
import { NextFunction } from 'express';
import Hash from '../../utils/Hash';
import Auth from '../../utils/Auth';
import {
    IRequestWithUser,
    LoginRequestBody,
    RegisterUserBody,
} from '../../interfaces/authInterfaces';
import formatZodValidationError from '../../helpers/formatZodValidationError';
import { ZodErrorType } from '../../types';
import User from '../models/User';
import { IUser } from '../../interfaces/userInterfaces';
import UserService from '../services/UserService';

const authHandlers = {
    register: async (
        request: Request<{}, {}, RegisterUserBody>,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> => {
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
            });

            // now parse and get all errors if false
            const parsedData = schema.safeParse(request.body);

            if (!parsedData.success) {
                const errors: ZodErrorType = formatZodValidationError(
                    parsedData.error
                );
                return next(new CustomError(422, errors));
            }

            const { name, email, password } = request.body;

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
            const user: IUser | null = await userService.createUser(
                name,
                email,
                hashedPassword,
                2
            );

            return response.status(201).json({
                success: true,
                message: 'User registered successfully',
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

    login: async (
        request: Request<{}, {}, LoginRequestBody>,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const schema = z.object({
                email: z
                    .string({
                        required_error: 'Email is required',
                        invalid_type_error: 'Email must be a string',
                    })
                    .email({
                        message: 'Please enter a valid email address',
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
            });

            const parsedData = schema.safeParse(request.body);
            if (!parsedData.success) {
                const errors: ZodErrorType = formatZodValidationError(
                    parsedData.error
                );
                return next(new CustomError(422, errors));
            }

            const { email, password } = request.body;

            // check if user exists
            const userService = new UserService();
            const user: IUser | null = await userService.getUserByEmail(email);

            if (!user) {
                return next(new CustomError(404, 'User not found'));
            }
            if (!user.password) {
                return next(
                    new CustomError(
                        400,
                        'Invalid credentials, please try again'
                    )
                );
            }
            if (!user.active) {
                return next(new CustomError(401, 'User is not active'));
            }
            // check if password is correct
            const isPasswordCorrect = await Hash.check(password, user.password);

            if (!isPasswordCorrect) {
                return next(new CustomError(401, 'Invalid credentials'));
            }

            // create access token, and refresh token
            const accessToken = Auth.createAccessToken({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
            const refreshToken = Auth.createRefreshToken({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            });

            // set referesh token in the response cookie
            response.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                path: '/',
            });

            return response.status(200).json({
                success: true,
                message: 'User logged in successfully',
                data: {
                    accessToken,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                },
            });
        } catch (error: any) {
            return next(
                new CustomError(500, error.message || 'Internal server error')
            );
        }
    },

    profile: async (
        request: IRequestWithUser,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        const user: IUser | null = await User.findById(request?.user?.id);
        return response.status(200).json({
            success: true,
            message: 'User profile fetched successfully',
            data: {
                user,
            },
        });
    },

    refreshToken: async (
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        response.setHeader('WWW-Authenticate', 'Bearer');
        const token = request.cookies.refreshToken;

        if (!token) {
            return next(new CustomError(400, 'Unauthorized'));
        }

        try {
            const decoded: any = Auth.decodeRefreshToken(token);

            // email should be present in payload
            if (!decoded.user || !decoded.user.email) {
                return next(new CustomError(400, 'Unauthorized'));
            }
            const email = decoded.user.email;

            const userService = new UserService();
            const user: IUser | null = await userService.getUserByEmail(email);

            if (!user) {
                return next(new CustomError(400, 'Unauthorized'));
            } else {
                try {
                    const accessToken = Auth.createAccessToken({
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    });

                    const token = Auth.createRefreshToken({
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    });

                    response.cookie('refreshToken', token, {
                        httpOnly: true,
                        secure: false,
                        sameSite: 'strict',
                        path: '/',
                    });
                    return response.status(200).json({
                        message: 'Authentication successful',
                        data: {
                            accessToken,
                            user: {
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                role: user.role,
                            },
                        },
                    });
                } catch (error: any) {
                    return next(new CustomError(500, error.message));
                }
            }
        } catch (error: any) {
            console.log(error);
            return next(
                new CustomError(
                    error.getStatusCode() == 401 ? 400 : error.getStatusCode(),
                    error.message
                )
            );
        }
    },

    logout: async (
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            response.clearCookie('refreshToken', {
                httpOnly: true,
                sameSite: 'strict',
                secure: false,
                path: '/',
            });
            return response.status(204).send('Logout successful');
        } catch (error: any) {
            return next(new CustomError(500, error.message));
        }
    },
};

export default authHandlers;
