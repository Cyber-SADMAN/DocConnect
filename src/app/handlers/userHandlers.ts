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

const authHandlers = {};

export default authHandlers;
