import { NextFunction, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import CustomError from './CustomError';
import { IRequestWithUser } from '../interfaces/authInterfaces';

class Auth {
    public static createAccessToken(user: object): string {
        let expiresIn: string;
        try {
            expiresIn =
                (process.env.ACCESS_TOKEN_EXPIRE_MINUTES as string) + 'm';
        } catch (error: any) {
            throw new CustomError(500, error.message || 'Something went wrong');
        }

        try {
            const token = sign(
                { user },
                process.env.ACCESS_TOKEN_SECRET as string,
                {
                    expiresIn,
                    algorithm: 'HS256',
                }
            );
            return token;
        } catch (error: any) {
            throw new CustomError(401, 'Unauthorized');
        }
    }

    public static createRefreshToken(user: object): string {
        let expiresIn: string;
        try {
            expiresIn =
                (process.env.ACCESS_TOKEN_EXPIRE_MINUTES as string) + 'm';
        } catch (error: any) {
            throw new CustomError(500, error.message || 'Something went wrong');
        }

        try {
            expiresIn =
                (process.env.REFRESH_TOKEN_EXPIRE_MINUTES as string) + 'm';
            const token = sign(
                { user },
                process.env.REFRESH_TOKEN_SECRET as string,
                {
                    expiresIn,
                    algorithm: 'HS256',
                }
            );
            return token;
        } catch (error: any) {
            throw new CustomError(401, 'Unauthorized');
        }
    }

    public static decodeAccessToken(token: string): object {
        try {
            return verify(
                token,
                process.env.ACCESS_TOKEN_SECRET as string
            ) as object;
        } catch (error: any) {
            throw new CustomError(401, 'Unauthorized from Auth');
        }
    }

    public static decodeRefreshToken(token: string): object {
        try {
            return verify(
                token,
                process.env.REFRESH_TOKEN_SECRET as string
            ) as object;
        } catch (error: any) {
            throw new CustomError(401, 'Unauthorized');
        }
    }

    // middlewares
    public static async isAuthenticated(
        request: IRequestWithUser,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> {
        let token: string =
            (request.headers.authorization as string) ||
            (request.headers.Authorization as string) ||
            '';

        if (token && token.startsWith('Bearer ')) {
            token = token.split(' ')[1];
        }

        if (!token) {
            return next(new CustomError(401, 'Unauthorized'));
        }

        try {
            const decoded: any = Auth.decodeAccessToken(token);

            // decoded have user and user have email, if not then return error
            if (!decoded.user || !decoded.user.email) {
                return next(new CustomError(401, 'Unauthorized'));
            }

            // add user to request
            request.user = decoded.user;
            next();
        } catch (error: any) {
            return next(new CustomError(401, 'Unauthorized'));
        }
    }

    private static async getRole(
        request: IRequestWithUser,
        response: Response,
        next: NextFunction
    ): Promise<Response | number | void> {
        try {
            if (request?.user && request?.user?.role) {
                return request.user?.role;
            } else {
                return next(new CustomError(401, 'Unauthorized'));
            }
        } catch (error: any) {
            return next(
                new CustomError(500, error.message || 'Something went wrong')
            );
        }
    }

    public static async isAdmin(
        request: IRequestWithUser,
        response: Response,
        next: NextFunction
    ): Promise<Response | number | void> {
        const role = await Auth.getRole(request, response, next);
        if (role === 1) {
            return next();
        } else {
            return next(new CustomError(403, 'Forbidden'));
        }
    }

    public static async isDoctor(
        request: IRequestWithUser,
        response: Response,
        next: NextFunction
    ): Promise<Response | number | void> {
        const role = await Auth.getRole(request, response, next);
        if (role === 2) {
            return next();
        } else {
            return next(new CustomError(403, 'Forbidden'));
        }
    }

    public static async isAssistant(
        request: IRequestWithUser,
        response: Response,
        next: NextFunction
    ): Promise<Response | number | void> {
        const role = await Auth.getRole(request, response, next);
        if (role === 3) {
            return next();
        } else {
            return next(new CustomError(403, 'Forbidden'));
        }
    }

    public static async isDoctorOrAssistant(
        request: IRequestWithUser,
        response: Response,
        next: NextFunction
    ): Promise<Response | number | void> {
        const role = await Auth.getRole(request, response, next);
        if (role == 2 || role === 3) {
            return next();
        } else {
            return next(new CustomError(403, 'Forbiddenx'));
        }
    }
}

export default Auth;
