import { Router } from 'express';
import {
  saveUser,
  getUser,
  updateUser,
  checkDuplicateEntry,
  getUserByMobileNumber,
  getUsers,
  deleteUser,
  getCurrentUser
} from '../../../controller/user.controller';
import { checkToken } from '@/src/middlewares/check-auth';

const userRouter: Router = Router();

// User routes

userRouter.get('/', getUsers);
userRouter.get('/profile/:id', getUser);
userRouter.get('/current', checkToken, getCurrentUser);
userRouter.post('/signup', saveUser);
userRouter.patch('/update/:id', updateUser);
userRouter.delete('/:id', deleteUser);
userRouter.post('/check-duplicate-entry', checkDuplicateEntry);
userRouter.get('/mobile-number/:mobileNumber', getUserByMobileNumber);

export default userRouter;
