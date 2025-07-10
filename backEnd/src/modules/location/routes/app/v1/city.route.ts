
import { Router } from 'express';
import { getAllCities } from '@/modules/location/controller/city.controller';
const router: Router = Router();

router.get('/', getAllCities);

export default router;