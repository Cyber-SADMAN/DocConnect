import { Router } from 'express';
import authHandlers from '../handlers/authHandlers';
import Auth from '../../utils/Auth';

const authRoutes: Router = Router();
const authMiddleware = Auth.isAuthenticated;

authRoutes.post('/register', authHandlers.register);
authRoutes.post('/login', authHandlers.login);
authRoutes.post('/refresh-token', authHandlers.refreshToken);
authRoutes.get('/profile', authMiddleware, authHandlers.profile);
authRoutes.post('/logout', authHandlers.logout);

export default authRoutes;
