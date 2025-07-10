import { Router } from 'express';
import { getAllProvinces } from '@/modules/location/controller/province.controller';

const router: Router = Router();


router.get('/', getAllProvinces);

export default router;
