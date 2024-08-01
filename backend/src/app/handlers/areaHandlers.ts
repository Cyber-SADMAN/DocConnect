import { NextFunction, Response, Request } from 'express';
import mongoose, { Error as MongooseError } from 'mongoose';
import { IArea, IDistrict } from '../../interfaces/areaInterfaces';
import CustomError from '../../utils/CustomError';
import District from '../models/District';
import Area from '../models/Area';

const areaHandlers = {
    getDistricts: async (
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const districts = await District.find();
            return response.status(200).json({
                success: true,
                data: { districts },
            });
        } catch (error: any) {
            return next(new CustomError(500, 'Something went wrong'));
        }
    },

    getAreasByDistrict: async (
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<Response | void> => {
        try {
            const districtName = request.params.district;

            // serch with name but case insensitive but exact
            // const district: IDistrict | null = await District.findOne({
            //     name: { $regex: new RegExp(`^${districtName}$`, 'i') },
            // });

            let district: IDistrict | null = null;

            const isValidObjectId =
                mongoose.Types.ObjectId.isValid(districtName);
            if (isValidObjectId) {
                district = await District.findById(districtName);
            } else {
                district = await District.findOne({
                    name: { $regex: new RegExp(`^${districtName}$`, 'i') },
                });
            }

            if (!district) {
                return next(new CustomError(404, 'District not found'));
            }

            const areas = await Area.find({
                districtId: district.id,
            }).select('-districtId');

            return response.status(200).json({
                success: true,
                data: { areas },
            });
        } catch (error: any) {
            return next(new CustomError(500, 'Something went wrong'));
        }
    },
};

export default areaHandlers;
