import { Document, Model, Mongoose, Schema } from 'mongoose';
import Database from '../../configs/Database';
import CustomError from '../../utils/CustomError';
import { IDistrict } from '../../interfaces/areaInterfaces';

let db: Mongoose;

try {
    db = Database.getInstance();
} catch (error: any) {
    throw new CustomError(500, error.message);
}

const districtCollectionName = 'districts';
let District: Model<IDistrict & Document>;

try {
    const districtSchema = new Schema<IDistrict>({
        name: {
            type: String,
            required: true,
        },
    });

    District =
        db.models[districtCollectionName] ||
        db.model<IDistrict & Document>(districtCollectionName, districtSchema);
} catch (error: any) {
    throw new CustomError(500, error.message);
}

export default District;
