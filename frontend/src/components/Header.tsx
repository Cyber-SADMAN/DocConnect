import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useLogout from '../hooks/useLogout';

const Header = () => {
    const { auth } = useAuth();
    const logout = useLogout();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-white shadow">
            <nav className="w-full flex justify-between items-center mx-auto h-14 max-w-6xl px-4">
                <div className="flex items-center">
                    <Link
                        to="/"
                        className="text-2xl font-bold text-blue-800 leading-none"
                    >
                        DocConnect
                    </Link>
                </div>

                {auth.token != '' ? (
                    <div className="flex gap-x-2 justify-end items-center">
                        <div className="px-2 bg-gray-200 py-1">Welcome, {auth.name}</div>
                        <div className="flex items-center">
                            <button
                                onClick={() => handleLogout()}
                                className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-500"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-end items-center">
                        <div className="flex items-center">
                            <Link
                                to="/login"
                                className="bg-blue-800 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
};

export default Header;
