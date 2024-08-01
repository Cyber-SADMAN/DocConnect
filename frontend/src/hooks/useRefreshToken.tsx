import { axiosPrivate } from '../api/axios';
import useAuth from './useAuth';
import useLogout from './useLogout';

const useRefreshToken = () => {
    const { setAuth } = useAuth();
    const logout = useLogout();

    const refresh = async () => {
        try {
            const response = await axiosPrivate.post('/auth/refresh-token');
            console.log('refresh: ', response);
            const data = response.data.data;

            setAuth({
                token: data.accessToken,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
            });

            return data.accessToken;
        } catch (error) {
            await logout();
            console.log('error from useRefreshToken.tsx', error);
            throw error;
        }
    };

    return refresh;
};

export default useRefreshToken;
