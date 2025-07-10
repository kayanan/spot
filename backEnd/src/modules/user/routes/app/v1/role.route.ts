import { Router } from 'express';
import { getRoles } from '../../../controller/role.controller';

const roleRouter: Router = Router();

// Role routes
roleRouter.get('/', getRoles);

export default roleRouter;
