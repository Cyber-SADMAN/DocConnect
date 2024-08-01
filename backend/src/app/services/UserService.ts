import { IUser } from '../../interfaces/userInterfaces';
import User from '../models/User';

class UserService {
    public async createUser(
        name: string,
        email: string,
        password: string,
        role: number
    ): Promise<IUser | null> {
        // create user
        try {
            const user = new User({
                name,
                email,
                password,
                role,
                active: true,
            });
            await user.save();

            delete user.password;

            return user;
        } catch (error: any) {
            throw error;
        }
    }

    public async getUserByEmail(email: string): Promise<IUser | null> {
        try {
            const user: IUser | null = await User.findOne({ email });
            return user;
        } catch (error: any) {
            throw error;
        }
    }

    public async getUser(id: string): Promise<IUser | null> {
        try {
            const user: IUser | null = await User.findOne({ _id: id });
            return user;
        } catch (error: any) {
            throw error;
        }
    }

    public async deleteUser(id: string): Promise<IUser | null> {
        try {
            const user: IUser | null = await User.findOne({ _id: id });
            if (!user) {
                throw new Error('User not found');
            }
            if (user.role == 2) {
                // delete the chambers and appointments as well
            }

            await User.deleteOne({ _id: id });

            return user;
        } catch (error: any) {
            throw error;
        }
    }
}

export default UserService;
