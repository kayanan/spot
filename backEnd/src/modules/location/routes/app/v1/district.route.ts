import { Router } from 'express';
import { getAllDistricts } from '@/modules/location/controller/district.controller';

const router: Router = Router();

router.get('/', getAllDistricts);

export default router;
