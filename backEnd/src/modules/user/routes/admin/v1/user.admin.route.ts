import { Router } from 'express';
import {
  getUsers,
  adminUpdateUser,
  approveParkingOwner,
  rejectParkingOwner,
  getPendingOwnersCount,
} from '../../../controller/user.controller';
import { checkAdmin, checkToken } from '@/src/middlewares/check-auth';
import multer from '@/src/middlewares/multer';
const userAdminRouter: Router = Router();

// User routes
userAdminRouter.get('/list', getUsers);
userAdminRouter.get('/pending-owners-count', getPendingOwnersCount);
userAdminRouter.patch(
  '/update/:id',
  multer,
  adminUpdateUser
);
userAdminRouter.patch(
  '/approve/:id',
  approveParkingOwner
);
userAdminRouter.post(
  '/reject/:id',
  rejectParkingOwner
);
export default userAdminRouter;
