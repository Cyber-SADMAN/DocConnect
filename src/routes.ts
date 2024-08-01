import { Router } from 'express';
import authRoutes from './app/routes/authRoutes';
import userRoutes from './app/routes/userRoutes';
import appointmentRoutes from './app/routes/appointmentRoutes';
import areaRoutes from './app/routes/areaRoutes';
import chamberRoutes from './app/routes/chamberRoutes';

import testRoutes from '../tests/testRoutes';
import getDashboardData from './app/handlers/dashboardHandlers';
import Auth from './utils/Auth';

const router: Router = Router();
const authMiddleware = Auth.isAuthenticated;

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/chambers', chamberRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/areas', areaRoutes);
router.get('/dashboard', authMiddleware, getDashboardData);

router.use('/test', testRoutes);

export default router;
