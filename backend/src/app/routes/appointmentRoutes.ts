import { Router } from 'express';
import appointmetHandlers from '../handlers/appointmentHandlers';
import Auth from '../../utils/Auth';

const appointmentRoutes: Router = Router();
const authMiddleware = Auth.isAuthenticated;
const isDoctorOrAssistant = Auth.isDoctorOrAssistant;

appointmentRoutes.post('/', appointmetHandlers.create);
appointmentRoutes.get(
    '/',
    [authMiddleware, isDoctorOrAssistant],
    appointmetHandlers.getAll
);
appointmentRoutes.post('/verify-code', appointmetHandlers.verifyCode);
appointmentRoutes.post('/resend-code', appointmetHandlers.resendCode);
appointmentRoutes.put(
    '/update-status/:id',
    [authMiddleware, isDoctorOrAssistant],
    appointmetHandlers.updateStatus
);

export default appointmentRoutes;
