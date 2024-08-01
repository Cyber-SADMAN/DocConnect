import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({
    _protected,
    allowedRoles,
}: {
    _protected: number;
    allowedRoles?: number[];
}) => {
    const { auth } = useAuth();

    const isAuthenticated = auth.token !== '';
    const location = useLocation();

    // if (_protected === 1 && !isAuthenticated) {
    //     // this route is protected but the user is not logged in
    //     return <Navigate to="/login" state={{ from: location }} replace />;
    // }

    // if (_protected === 0 && isAuthenticated) {
    //     // this route is not protected but the user is logged in
    //     // so navigate to the home page, these routes are {login, register} which are only for logged out users
    //     return <Navigate to="/dashboard" replace />;
    // }

    if (_protected) {
        // means the user should be logged in

        if (!isAuthenticated) {
            // if the user is not logged in, then navigate to the login page
            return <Navigate to="/login" state={{ from: location }} replace />;
        }

        // the user is logged in, but we need to check if the user is allowed to access this route
        const curUserRole = auth.role;

        if (allowedRoles && !allowedRoles.includes(curUserRole)) {
            return <Navigate to="/dashboard" replace />;
        }
    } else {
        // means the user should not be logged in

        if (isAuthenticated) {
            // still if the user is logged in, then navigate to the dashboard
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
