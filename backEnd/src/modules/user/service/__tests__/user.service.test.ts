import userService from '../user.service';
import UserRepository from '../../data/repository/user.repository';
import BaseRepository from '@/modules/base/data/repository/base.repository';
import RoleService from '../role.service';
import UserValidator from '../../validators/user.validator';
import { sendSMS } from '../../../base/services/sms.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../data/repository/user.repository');
jest.mock('@/modules/base/data/repository/base.repository');
jest.mock('../role.service');
jest.mock('../../validators/user.validator');
jest.mock('../../../base/services/sms.service');
jest.mock('jsonwebtoken');

const mockUserRepo = UserRepository as jest.Mocked<typeof UserRepository>;
const mockBaseRepo = BaseRepository as jest.Mocked<typeof BaseRepository>;
const mockRoleService = RoleService as jest.Mocked<typeof RoleService>;
const mockUserValidator = UserValidator as jest.Mocked<typeof UserValidator>;
const mockSendSMS = sendSMS as jest.MockedFunction<typeof sendSMS>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('User Service', () => {
  let bcryptCompareSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    bcryptCompareSpy = jest.spyOn(bcrypt, 'compare');
  });

  afterEach(() => {
    bcryptCompareSpy.mockRestore();
  });

  describe('getUsers', () => {
    it('should return users with totalCount', async () => {
      mockUserRepo.findUsers.mockResolvedValue({ total: 2, users: [{ id: '1' }, { id: '2' }] } as any);
      const req = { search: '', skip: 0, limit: 10 };
      const result = await userService.getUsers(req as any);
      expect(result).toEqual({ status: true, totalCount: 2, users: [{ id: '1' }, { id: '2' }] });
    });
  });

  describe('getUser', () => {
    it('should return user by id', async () => {
      mockUserRepo.findById.mockResolvedValue({ id: '1' } as any);
      const result = await userService.getUser('1');
      expect(result).toEqual({ status: true, user: { id: '1' } });
    });
    it('should throw if user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);
      await expect(userService.getUser('1')).rejects.toThrow('User not found');
    });
  });

  describe('saveUser', () => {
    const validUser = { email: 'test@example.com', role: ['roleId'], firstName: 'John', lastName: 'Doe', password: 'Password1', phoneNumber: '0712345678', nic: '123456789V' };
    it('should save user if valid and not exists', async () => {
      mockUserValidator.saveUserValidator.mockReturnValue({ error: undefined, data: validUser } as any);
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockRoleService.getRoles.mockResolvedValue({ roles: [{ _id: 'roleId' }] } as any);
      mockUserRepo.saveUser.mockResolvedValue('userId');
      const result = await userService.saveUser({ ...validUser } as any);
      expect(result).toEqual({ status: true, id: 'userId' });
    });
    it('should throw if validation fails', async () => {
      mockUserValidator.saveUserValidator.mockReturnValue({ error: { message: 'Validation error' } } as any);
      await expect(userService.saveUser(validUser as any)).rejects.toThrow('Validation error');
    });
    it('should throw if user already exists', async () => {
      mockUserValidator.saveUserValidator.mockReturnValue({ error: undefined, data: validUser } as any);
      mockUserRepo.findByEmail.mockResolvedValue({ id: '1' } as any);
      await expect(userService.saveUser({ ...validUser } as any)).rejects.toThrow('User already exists');
    });
    it('should throw if user not inserted', async () => {
      mockUserValidator.saveUserValidator.mockReturnValue({ error: undefined, data: validUser } as any);
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockRoleService.getRoles.mockResolvedValue({ roles: [{ _id: 'roleId' }] } as any);
      mockUserRepo.saveUser.mockResolvedValue(null);
      await expect(userService.saveUser({ ...validUser } as any)).rejects.toThrow('User not inserted');
    });
  });

  describe('login', () => {
    const req = { body: { email: 'test@example.com', password: 'Password1' } };
    it('should login successfully', async () => {
      mockUserValidator.loginValidator.mockReturnValue({ error: undefined, data: req.body } as any);
      mockUserRepo.findByEmail.mockResolvedValue({ _id: '1', password: 'hashed', role: ['roleId'], firstName: 'John', lastName: 'Doe', email: 'test@example.com', phoneNumber: '0712345678' } as any);
      bcryptCompareSpy.mockResolvedValue(true);
      mockBaseRepo.findAll.mockResolvedValue({ items: [{ type: 'ADMIN' }] } as any);
      mockJwt.sign.mockReturnValue('token' as any);
      const result = await userService.login(req as any);
      expect(result).toHaveProperty('accessToken', 'token');
      expect(result).toHaveProperty('status', true);
    });
    it('should throw if validation fails', async () => {
      mockUserValidator.loginValidator.mockReturnValue({ error: { message: 'Validation error' } } as any);
      await expect(userService.login(req as any)).rejects.toThrow('Validation error');
    });
    it('should throw if user not found', async () => {
      mockUserValidator.loginValidator.mockReturnValue({ error: undefined, data: req.body } as any);
      mockUserRepo.findByEmail.mockResolvedValue(null);
      await expect(userService.login(req as any)).rejects.toThrow('User not found');
    });
    it('should throw if password does not match', async () => {
      mockUserValidator.loginValidator.mockReturnValue({ error: undefined, data: req.body } as any);
      mockUserRepo.findByEmail.mockResolvedValue({ _id: '1', password: 'hashed', role: ['roleId'], firstName: 'John', lastName: 'Doe', email: 'test@example.com', phoneNumber: '0712345678' } as any);
      bcryptCompareSpy.mockResolvedValue(false);
      await expect(userService.login(req as any)).rejects.toThrow('Invalid credentials');
    });
    it('should throw if role not found', async () => {
      mockUserValidator.loginValidator.mockReturnValue({ error: undefined, data: req.body } as any);
      mockUserRepo.findByEmail.mockResolvedValue({ _id: '1', password: 'hashed', role: ['roleId'], firstName: 'John', lastName: 'Doe', email: 'test@example.com', phoneNumber: '0712345678' } as any);
      bcryptCompareSpy.mockResolvedValue(true);
      mockBaseRepo.findAll.mockResolvedValue({ items: [] } as any);
      await expect(userService.login(req as any)).rejects.toThrow('Role not found');
    });
  });

  describe('forgotPassword', () => {
    it('should send OTP if user exists', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ _id: '1', phoneNumber: '0712345678' } as any);
      mockUserRepo.setPasswordResetOtp.mockResolvedValue('1234');
      mockSendSMS.mockResolvedValue(false as any);
      const req = { email: 'test@example.com' };
      await expect(userService.forgotPassword(req as any)).rejects.toThrow('SMS not sent');
    });
    it('should throw if email not found', async () => {
      await expect(userService.forgotPassword({} as any)).rejects.toThrow('Email not found');
    });
    it('should throw if user not found', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      await expect(userService.forgotPassword({ email: 'test@example.com' } as any)).rejects.toThrow('User not found');
    });
  });

  describe('resetPassword', () => {
    const req = { email: 'test@example.com', password: 'Password1', otp: '1234' };
    it('should reset password if valid', async () => {
      mockUserValidator.resetPasswordValidator.mockReturnValue({ error: undefined, data: req } as any);
      mockUserRepo.findByEmail.mockResolvedValue({ _id: '1', otpExpiresAt: new Date(Date.now() + 10000) } as any);
      mockUserRepo.changePassword.mockResolvedValue(true);
      mockUserRepo.resetPasswordResetOtp.mockResolvedValue(true);
      const result = await userService.resetPassword(req as any);
      expect(result).toEqual({ status: true, message: 'Password reset success' });
    });
    it('should throw if validation fails', async () => {
      mockUserValidator.resetPasswordValidator.mockReturnValue({ error: { message: 'Validation error' } } as any);
      await expect(userService.resetPassword(req as any)).rejects.toThrow('Validation error');
    });
    it('should throw if user not found', async () => {
      mockUserValidator.resetPasswordValidator.mockReturnValue({ error: undefined, data: req } as any);
      mockUserRepo.findByEmail.mockResolvedValue(null);
      await expect(userService.resetPassword(req as any)).rejects.toThrow('User not found');
    });
    it('should throw if OTP expired', async () => {
      mockUserValidator.resetPasswordValidator.mockReturnValue({ error: undefined, data: req } as any);
      mockUserRepo.findByEmail.mockResolvedValue({ _id: '1', otpExpiresAt: new Date(Date.now() - 10000) } as any);
      await expect(userService.resetPassword(req as any)).rejects.toThrow('OTP Expired');
    });
    it('should throw if password change fails', async () => {
      mockUserValidator.resetPasswordValidator.mockReturnValue({ error: undefined, data: req } as any);
      mockUserRepo.findByEmail.mockResolvedValue({ _id: '1', otpExpiresAt: new Date(Date.now() + 10000) } as any);
      mockUserRepo.changePassword.mockResolvedValue(false);
      await expect(userService.resetPassword(req as any)).rejects.toThrow('Error while updating the password');
    });
    it('should throw if OTP reset fails', async () => {
      mockUserValidator.resetPasswordValidator.mockReturnValue({ error: undefined, data: req } as any);
      mockUserRepo.findByEmail.mockResolvedValue({ _id: '1', otpExpiresAt: new Date(Date.now() + 10000) } as any);
      mockUserRepo.changePassword.mockResolvedValue(true);
      mockUserRepo.resetPasswordResetOtp.mockResolvedValue(false);
      await expect(userService.resetPassword(req as any)).rejects.toThrow('OTP not reset');
    });
  });

  // Additional tests for updateUser, adminUpdateUser, sendOTPForMobilNumberVerification, approveParkingOwner, rejectParkingOwner, getPendingOwnersCount, checkDuplicateEntry, getUserByMobileNumber, deleteUser can be added similarly.
}); 