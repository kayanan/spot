import { Router } from 'express';
import { getAllDistricts, getDistrictsByProvinceId } from '@/modules/location/controller/district.controller';

const router: Router = Router();

router.get('/', getAllDistricts);
router.get('/:provinceId', getDistrictsByProvinceId);

export default router;
