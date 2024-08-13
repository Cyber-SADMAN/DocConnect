import { Router } from 'express';
import doctorHandlers from '../handlers/doctorHandlers';
import Auth from '../../utils/Auth';
import assistantHandlers from '../handlers/assistantHandlers';

const authMiddleware = Auth.isAuthenticated;
const isAdmin = Auth.isAdmin;
const isDoctor = Auth.isDoctor;
const isAssistant = Auth.isAssistant;

const userRoutes: Router = Router();

// assistants routes, only doctor is allowed to perform assistant CRUD
userRoutes.post(
    '/assistants',
    [authMiddleware, isDoctor],
    assistantHandlers.create
);
userRoutes.get(
    '/assistants',
    [authMiddleware, isDoctor],
    assistantHandlers.getAll
);
userRoutes.get(
    '/assistants/:id',
    [authMiddleware, isDoctor],
    assistantHandlers.get
);
userRoutes.put(
    '/assistants/:id',
    [authMiddleware, isDoctor],
    assistantHandlers.update
);

// doctors routes
userRoutes.get('/doctors', doctorHandlers.getDoctors);
userRoutes.get(
    '/doctors/get-specializations',
    doctorHandlers.getDoctorSpecializations
);
userRoutes.get('/doctors/:id', doctorHandlers.getDoctor);

export default userRoutes;
