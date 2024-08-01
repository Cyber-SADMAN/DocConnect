import { Document, Model, Mongoose, Schema } from 'mongoose';
import Database from '../../configs/Database';
import CustomError from '../../utils/CustomError';
import { IUser } from '../../interfaces/userInterfaces';

let db: Mongoose;

try {
    db = Database.getInstance();
} catch (error: any) {
    throw new CustomError(500, error.message);
}

const collectionName = 'users';
let User: Model<IUser & Document>;

try {
    const schema = new Schema<IUser>(
        {
            name: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
                unique: true,
            },
            password: {
                type: String,
                required: true,
            },  
            education: String,
            experience: {
                type: {
                    title: String,
                    institute: String,
                    address: String,
                },
            },
            specializations: [String],
            active: {
                type: Boolean,
                required: true,
                default: true,
            },
            role: {
                type: Number,
                required: true,
            },
            assignedChamber: {
                type: Schema.Types.ObjectId,
                ref: 'chambers',
            },
            chambers: [{ type: Schema.Types.ObjectId, ref: 'chambers' }],
        },
        { timestamps: true }
    );

    User =
        db.models[collectionName] ||
        db.model<IUser & Document>(collectionName, schema);
} catch (error: any) {
    throw new CustomError(500, error.message);
}

export default User;
