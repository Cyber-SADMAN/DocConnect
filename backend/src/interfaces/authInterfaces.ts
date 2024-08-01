import { Request } from 'express';

export interface RegisterUserBody {
    name: string;
    email: string;
    password: string;
}

export interface LoginRequestBody {
    email: string;
    password: string;
}

export interface IRequestUser {
    id: string;
    name: string;
    email: string;
    role: number;
}

export interface IRequestWithUser extends Request {
    user?: IRequestUser;
}
