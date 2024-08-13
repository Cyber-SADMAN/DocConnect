import { useState, useEffect, ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTachometerAlt,
    faUsers,
    faCaretDown,
    faMoon,
    faSun,
    faUser,
    faBars,
    faHouse,
    faCalendarCheck,
} from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useLogout from '../../hooks/useLogout';
import toast from 'react-hot-toast';

const AdminLayout = ({ children }: { children: ReactNode }) => {
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const [showSidebar, setShowSidebar] = useState<boolean>(true);
    const [showProfileDropdown, setShowProfileDropdown] =
        useState<boolean>(false);
    const [isSmallScreen, setIsSmallScreen] = useState<boolean>(
        window.innerWidth < 768
    );

    const { auth } = useAuth();
    const logout = useLogout();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error: any) {
            console.error(error);
        }
    };

    useEffect(() => {
        // Load dark mode setting from localStorage
        const isDarkMode: boolean = localStorage.getItem('darkMode') === 'true';
        setDarkMode(isDarkMode);

        // Add event listener for screen resize
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Save dark mode setting to localStorage
        localStorage.setItem('darkMode', darkMode.toString());
        // Apply dark mode class to the root element
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };

    const toggleProfileDropdown = () => {
        setShowProfileDropdown(!showProfileDropdown);
    };

    return (
        <div className="flex min-h-screen">
            {showSidebar && (
                <aside
                    className={`bg-gray-50 dark:bg-gray-800 ${
                        isSmallScreen
                            ? 'fixed inset-y-0 left-0 z-50 w-64'
                            : 'w-64'
                    } ${showSidebar ? 'block' : 'hidden'} sm:block`}
                >
                    <div className="flex items-center justify-between p-4">
                        <h1 className="text-2xl font-semibold text-black dark:text-white">
                            DocConnect
                        </h1>
                        {isSmallScreen && (
                            <button
                                className="text-gray-900 dark:text-white focus:outline-none"
                                onClick={toggleSidebar}
                            >
                                <FontAwesomeIcon icon={faBars} />
                            </button>
                        )}
                    </div>
                    <ul className="space-y-1">
                        <li>
                            <Link
                                to="/dashboard"
                                className="flex items-center p-4 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                                <FontAwesomeIcon
                                    icon={faTachometerAlt}
                                    className="mr-3"
                                />
                                Dashboard
                            </Link>
                        </li>
                        {auth.role == 2 && (
                            <li>
                                <Link
                                    to="/chambers"
                                    className="flex items-center p-4 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                    <FontAwesomeIcon
                                        icon={faHouse}
                                        className="mr-3"
                                    />
                                    Chambers
                                </Link>
                            </li>
                        )}
                        {auth.role == 3 && (
                            <li>
                                <Link
                                    to="/chambers/my-chamber"
                                    className="flex items-center p-4 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                    <FontAwesomeIcon
                                        icon={faHouse}
                                        className="mr-3"
                                    />
                                    Chamber
                                </Link>
                            </li>
                        )}
                        {(auth.role == 2 || auth.role == 3) && (
                            <li>
                                <Link
                                    to="/appointments"
                                    className="flex items-center p-4 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                    <FontAwesomeIcon
                                        icon={faCalendarCheck}
                                        className="mr-3"
                                    />
                                    Appointments
                                </Link>
                            </li>
                        )}
                        {auth.role == 2 && (
                            <li>
                                <Link
                                    to="/assistants"
                                    className="flex items-center p-4 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                    <FontAwesomeIcon
                                        icon={faUsers}
                                        className="mr-3"
                                    />
                                    Assistants
                                </Link>
                            </li>
                        )}
                    </ul>
                </aside>
            )}

            {/* Right Section (Header, Main Content, Footer) */}
            <div className="flex flex-col flex-1">
                {/* Header */}
                <header className="bg-blue-600 text-white py-4 px-5 flex justify-between items-center">
                    <div className="flex items-center">
                        <button
                            className="mr-4 focus:outline-none"
                            onClick={toggleSidebar}
                        >
                            <FontAwesomeIcon
                                icon={faBars}
                                className="text-xl"
                            />
                        </button>
                        {!showSidebar && !isSmallScreen && (
                            <h1 className="text-2xl font-semibold">
                                DocConnect
                            </h1>
                        )}
                    </div>
                    <div className="flex items-center">
                        <button
                            className="mr-4 focus:outline-none"
                            onClick={toggleDarkMode}
                        >
                            <FontAwesomeIcon
                                icon={darkMode ? faSun : faMoon}
                                className="text-xl"
                            />
                        </button>
                        <div className="relative">
                            <button
                                className="focus:outline-none"
                                onClick={toggleProfileDropdown}
                            >
                                <FontAwesomeIcon
                                    icon={faUser}
                                    className="text-xl"
                                />
                                <FontAwesomeIcon
                                    icon={faCaretDown}
                                    className="ml-1"
                                />
                            </button>
                            {showProfileDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-10">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                                    >
                                        Profile
                                    </Link>
                                    <a
                                        href="javascript:void(0)"
                                        onClick={handleLogout}
                                        className="block px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                                    >
                                        Logout
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-5">{children}</div>

                {/* Footer */}
                <footer className="bg-gray-200 dark:bg-gray-700 text-center text-gray-700 dark:text-white py-4 px-6">
                    <p>
                        &copy; {new Date().getFullYear()} DocConnect. All rights
                        reserved.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default AdminLayout;
