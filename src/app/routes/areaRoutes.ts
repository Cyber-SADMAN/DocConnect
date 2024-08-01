import { Router } from 'express';
import areaHandlers from '../handlers/areaHandlers';

const areaRoutes: Router = Router();

areaRoutes.get('/get-districts', areaHandlers.getDistricts);
areaRoutes.get(
    '/get-areas-by-district/:district',
    areaHandlers.getAreasByDistrict
);

export default areaRoutes;
