import { Router } from 'express';
import { generateReportController, getAvailableReportTypes } from '../../../controller/report.controller';
import { checkToken } from '../../../../../middlewares/check-auth';

const reportAdminRouter = Router();

// Get available report types
reportAdminRouter.get('/types', getAvailableReportTypes);

// Generate report
reportAdminRouter.post('/generate', generateReportController);

export default reportAdminRouter; 