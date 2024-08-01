import { Document, Model, Mongoose, Schema } from 'mongoose';
import Database from '../../configs/Database';
import CustomError from '../../utils/CustomError';
import { IArea } from '../../interfaces/areaInterfaces';
let db: Mongoose;

try {
    db = Database.getInstance();
} catch (error: any) {
    throw new CustomError(500, error.message);
}

const areaCollectionName = 'areas';
let Area: Model<IArea & Document>;

try {
    const areaSchema = new Schema<IArea>({
        name: {
            type: String,
            required: true,
        },
        districtId: {
            type: Schema.Types.ObjectId,
            ref: 'districts', // Assuming the reference to the district collection is 'districts'
            required: true,
        },
    });

    Area =
        db.models[areaCollectionName] ||
        db.model<IArea & Document>(areaCollectionName, areaSchema);
} catch (error: any) {
    throw new CustomError(500, error.message);
}

export default Area;
