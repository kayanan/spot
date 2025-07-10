import { Router } from 'express';
import { generateReportController, getAvailableReportTypes } from '../../../controller/report.controller';
import { checkToken } from '../../../../../middlewares/check-auth';

const router = Router();

// Get available report types
router.get('/types', checkToken, getAvailableReportTypes);

// Generate report
router.post('/generate', checkToken, generateReportController);

export default router; 