import { Router } from 'express';
import Auth from '../../utils/Auth';
import chamberHandlers from '../handlers/chamberHandlers';

const chamberRoutes: Router = Router();
const authMiddleware = Auth.isAuthenticated;
const isDoctor = Auth.isDoctor;
const isAssistant = Auth.isAssistant;
const isDoctorOrAssistant = Auth.isDoctorOrAssistant;

chamberRoutes.post(
    '/',
    [authMiddleware, isDoctor],
    chamberHandlers.createChamber
);

chamberRoutes.get('/', [authMiddleware, isDoctor], chamberHandlers.getChambers);

chamberRoutes.get(
    '/my-chamber',
    [authMiddleware, isAssistant],
    chamberHandlers.myChamber
);

chamberRoutes.get(
    '/:id',
    [authMiddleware, isDoctorOrAssistant],
    chamberHandlers.getChamber
);

chamberRoutes.put(
    '/:id',
    [authMiddleware, isDoctor],
    chamberHandlers.updateChamber
);

export default chamberRoutes;
