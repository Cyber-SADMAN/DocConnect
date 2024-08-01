import { ZodError } from 'zod';
import { ZodErrorType } from '../types';

const formatZodValidationError = (error: ZodError): ZodErrorType => {
    let errorObj: ZodErrorType = {};
    for (const err of error.errors) {
        const key = err.path.join('.');
        errorObj[key] = err.message;

        errorObj = {
            ...errorObj,
            [key]: err.message,
        };
    }

    return errorObj;
};

export default formatZodValidationError;
