import { Types } from 'mongoose';
import { IChamber, IDoctor, IUser } from '../../interfaces/userInterfaces';
import User from '../models/User';
import Appointment from '../models/Appointment'; // Ensure to import your Appointment model
import { addDays, startOfDay } from 'date-fns';
import { formatInTimeZone, toZonedTime, format } from 'date-fns-tz';

class DoctorService {
    public async getAppointmentCount(
        chamberId: string,
        date: string
    ): Promise<number> {
        const appointments = await Appointment.aggregate([
            {
                $match: {
                    chamberId: new Types.ObjectId(chamberId),
                    date: date,
                },
            },
            {
                $group: {
                    _id: '$date',
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    count: 1,
                },
            },
        ]).exec();

        if (appointments.length > 0) {
            return appointments[0].count;
        }

        return 0;
    }

    public async getAppointmentCounts(
        chambers: IChamber[]
    ): Promise<Record<string, any>> {
        const result: Record<string, any> = {};
        const bangladeshTimeZone = 'Asia/Dhaka';

        // Get today's date in local timezone
        const today = new Date();
        const localToday = toZonedTime(today, bangladeshTimeZone);

        // Generate an array of the next 7 days (including today)
        const dates = Array.from({ length: 7 }, (_, i) => {
            const date = addDays(localToday, i);
            const zonedDate = toZonedTime(startOfDay(date), bangladeshTimeZone);
            const formattedDate = format(zonedDate, 'yyyy-MM-dd');

            return {
                date: formattedDate,
                weekday: formatInTimeZone(
                    zonedDate,
                    bangladeshTimeZone,
                    'EEEE'
                ).toLowerCase(),
            };
        });

        for (const chamber of chambers) {
            const appointmentCounts = [];
            for (const date of dates) {
                const count = await this.getAppointmentCount(
                    chamber._id,
                    date.date
                );
                appointmentCounts.push({
                    date: date.date,
                    weekday: date.weekday,
                    count,
                });
            }

            result[chamber._id.toString()] = appointmentCounts;
        }
        return result;
    }

    public async getAllDoctors(
        doctorName: string | null,
        chamberDistrict: string | null,
        chamberAreas: string[],
        doctorSpecializations: string[]
    ): Promise<IDoctor[]> {
        try {
            const pipeline = [];

            // Match users with role=2 (doctors)
            pipeline.push({ $match: { role: 2 } });

            // Optional: Match doctor name
            if (doctorName) {
                pipeline.push({
                    $match: { name: { $regex: new RegExp(doctorName, 'i') } },
                });
            }

            // Lookup chambers for each doctor
            pipeline.push({
                $lookup: {
                    from: 'chambers',
                    localField: '_id',
                    foreignField: 'doctorId',
                    as: 'chambers',
                },
            });

            // Unwind chambers array
            pipeline.push({ $unwind: '$chambers' });

            // Lookup district for each chamber
            pipeline.push({
                $lookup: {
                    from: 'districts',
                    localField: 'chambers.districtId',
                    foreignField: '_id',
                    as: 'district',
                },
            });

            // Lookup area for each chamber
            pipeline.push({
                $lookup: {
                    from: 'areas',
                    localField: 'chambers.areaId',
                    foreignField: '_id',
                    as: 'area',
                },
            });

            // Unwind district array
            pipeline.push({ $unwind: '$district' });

            // Unwind area array
            pipeline.push({ $unwind: '$area' });

            // Optional: Match chamber district
            if (chamberDistrict) {
                pipeline.push({ $match: { 'district.name': chamberDistrict } });
            }

            // Optional: Match chamber areas
            if (chamberAreas.length > 0) {
                pipeline.push({
                    $match: { 'area.name': { $in: chamberAreas } },
                });
            }

            // Optional: Match specializations
            if (doctorSpecializations.length > 0) {
                pipeline.push({
                    $match: {
                        specializations: { $in: doctorSpecializations },
                    },
                });
            }

            // Group back to users, aggregating chambers into an array
            pipeline.push({
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    email: { $first: '$email' },
                    role: { $first: '$role' },
                    education: { $first: '$education' },
                    experience: { $first: '$experience' },
                    specializations: { $first: '$specializations' },
                    // chambers: { $addToSet: '$chambers' },
                    // district: { $addToSet: '$district.name' }
                    chambers: {
                        $addToSet: {
                            $mergeObjects: [
                                '$chambers',
                                { district: '$district' },
                                { area: '$area' },
                            ],
                        },
                    },
                },
            });

            const doctors: IDoctor[] = await User.aggregate(pipeline);

            if (
                doctors.length > 0 &&
                doctors[0].chambers &&
                doctors[0].chambers.length > 0
            ) {
                doctors[0].chambers[0].district;
            }

            return doctors;
        } catch (error: any) {
            console.log(error);
            throw error;
        }
    }

    public async getDoctor(id: string): Promise<IDoctor | null> {
        try {
            const user: IUser | null = await User.findOne({ _id: id });
            if (!user || user.role !== 2) {
                // throw new Error('Doctor not found');
                return null;
            }

            // get doctor with chambers
            const _objId = new Types.ObjectId(id);
            const doctors: IDoctor[] = await User.aggregate([
                { $match: { _id: _objId } },
                {
                    $lookup: {
                        from: 'chambers',
                        localField: '_id',
                        foreignField: 'doctorId',
                        as: 'chambers',
                    },
                },
                {
                    $unwind: '$chambers',
                },
                {
                    $match: { 'chambers.active': true },
                },
                {
                    $lookup: {
                        from: 'districts',
                        localField: 'chambers.districtId',
                        foreignField: '_id',
                        as: 'district',
                    },
                },
                {
                    $unwind: '$district',
                },
                {
                    $lookup: {
                        from: 'areas',
                        localField: 'chambers.areaId',
                        foreignField: '_id',
                        as: 'area',
                    },
                },
                {
                    $unwind: '$area',
                },
                {
                    $group: {
                        _id: '$_id',
                        name: { $first: '$name' },
                        email: { $first: '$email' },
                        role: { $first: '$role' },
                        education: { $first: '$education' },
                        experience: { $first: '$experience' },
                        specializations: { $first: '$specializations' },
                        chambers: {
                            $addToSet: {
                                $mergeObjects: [
                                    '$chambers',
                                    { district: '$district' },
                                    { area: '$area' },
                                ],
                            },
                        },
                        active: { $first: '$active' },
                    },
                },
            ]);

            if (doctors.length > 0) {
                let doctor = doctors[0];
                let appointmentCounts = await this.getAppointmentCounts(
                    doctor.chambers
                );

                return doctor;
            }

            return null;
        } catch (error: any) {
            console.log(error);
            throw error;
        }
    }
}

export default DoctorService;
