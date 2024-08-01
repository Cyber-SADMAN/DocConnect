import { RouteType } from '../types';

import Index from '../pages/Index';

import Dashboard from '../pages/Dashboard';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

import Chambers from '../pages/chambers/List';
import CreateChamber from '../pages/chambers/Create';
import EditChamber from '../pages/chambers/Edit';
import Show from '../pages/doctors/Show';
import AppointmentVerification from '../pages/doctors/AppointmentVerification';
import Appointments from '../pages/appointments/List';
import CreateAssistant from '../pages/assistants/Create';
import Assistants from '../pages/assistants/List';
import EditAssistant from '../pages/assistants/Edit';
import MyChamber from '../pages/chambers/MyChamber';
import Profile from '../pages/auth/Profile';

/*
-1: public
0:  must not be logged in
1:  must be logged in
*/
const routes: RouteType[] = [
    { path: '/', element: Index, _protected: 0 },
    { path: '/doctors/:id', element: Show, _protected: 0 },
    {
        path: '/appointment-verification',
        element: AppointmentVerification,
        _protected: 0,
    },

    // auth routes
    { path: '/register', element: Register, _protected: 0 },
    { path: '/login', element: Login, _protected: 0 },
    { path: '/profile', element: Profile, _protected: 1 },

    {
        path: '/dashboard',
        element: Dashboard,
        _protected: 1,
        allowedRoles: [1, 2, 3],
    },

    // chambers routes
    { path: '/chambers', element: Chambers, _protected: 1, allowedRoles: [2] },
    {
        path: '/chambers/create',
        element: CreateChamber,
        _protected: 1,
        allowedRoles: [2],
    },
    {
        path: '/chambers/edit/:id',
        element: EditChamber,
        _protected: 1,
        allowedRoles: [2, 3],
    },
    {
        path: '/chambers/my-chamber',
        element: MyChamber,
        _protected: 1,
        allowedRoles: [2, 3],
    },

    // appointments routes
    {
        path: '/appointments',
        element: Appointments,
        _protected: 1,
        allowedRoles: [2, 3],
    },

    // assistants routes
    {
        path: '/assistants',
        element: Assistants,
        _protected: 1,
        allowedRoles: [2],
    },
    {
        path: '/assistants/create',
        element: CreateAssistant,
        _protected: 1,
        allowedRoles: [2],
    },
    {
        path: '/assistants/edit/:id',
        element: EditAssistant,
        _protected: 1,
        allowedRoles: [2],
    },
];

export default routes;
