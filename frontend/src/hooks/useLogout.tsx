import { axiosPrivate } from '../api/axios';
import useAuth from './useAuth';

const useLogout = () => {
    const { setAuth } = useAuth();

    const logout = async () => {
        try {
            await axiosPrivate.post('/auth/logout');
            setAuth({
                token: '',
                name: '',
                email: '',
                role: 0,
            });
        } catch (error: any) {
            console.error(error);
            throw error;
        }
    };

    return logout;
};

export default useLogout;
