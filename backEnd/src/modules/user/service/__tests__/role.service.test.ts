import roleService from '../role.service';
import BaseRepository from '@/modules/base/data/repository/base.repository';
import RoleValidator from '../../validators/role.validator';
import UserRepository from '../../data/repository/user.repository';

jest.mock('@/modules/base/data/repository/base.repository');
jest.mock('../../validators/role.validator');
jest.mock('../../data/repository/user.repository');

const mockBaseRepo = BaseRepository as jest.Mocked<typeof BaseRepository>;
const mockRoleValidator = RoleValidator as jest.Mocked<typeof RoleValidator>;
const mockUserRepo = UserRepository as jest.Mocked<typeof UserRepository>;

describe('Role Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRoles', () => {
    it('should return roles with totalCount', async () => {
      const mockRoles = { totalCount: 2, items: [{ id: '1', type: 'ADMIN' }, { id: '2', type: 'USER' }] };
      mockBaseRepo.findAll.mockResolvedValue(mockRoles as any);
      const req = { search: '', skip: 0, limit: 10 };
      const result = await roleService.getRoles(req as any);
      expect(mockBaseRepo.findAll).toHaveBeenCalled();
      expect(result).toEqual({ status: true, totalCount: 2, roles: mockRoles.items });
    });
    it('should handle search', async () => {
      mockBaseRepo.findAll.mockResolvedValue({ totalCount: 1, items: [{ id: '1', type: 'ADMIN' }] } as any);
      const req = { search: 'ADMIN', skip: 0, limit: 10 };
      await roleService.getRoles(req as any);
      expect(mockBaseRepo.findAll).toHaveBeenCalled();
    });
  });

  describe('getRole', () => {
    it('should return role by id', async () => {
      const mockRole = { id: '1', type: 'ADMIN' };
      mockBaseRepo.findById.mockResolvedValue(mockRole as any);
      const result = await roleService.getRole('1');
      expect(mockBaseRepo.findById).toHaveBeenCalledWith(expect.anything(), '1');
      expect(result).toEqual({ status: true, role: mockRole });
    });
    it('should throw if role not found', async () => {
      mockBaseRepo.findById.mockResolvedValue(null);
      await expect(roleService.getRole('1')).rejects.toThrow('Role not found for id 1');
    });
  });

  describe('createRole', () => {
    const validRole = { type: 'ADMIN', description: 'desc', isActive: true };
    it('should create role if valid', async () => {
      mockRoleValidator.createUpdateRoleValidator.mockReturnValue({ success: true, data: validRole } as any);
      mockBaseRepo.create.mockResolvedValue('roleId');
      const result = await roleService.createRole(validRole as any);
      expect(mockRoleValidator.createUpdateRoleValidator).toHaveBeenCalledWith(validRole);
      expect(mockBaseRepo.create).toHaveBeenCalledWith(expect.anything(), validRole);
      expect(result).toEqual({ status: true, id: 'roleId' });
    });
    it('should throw if validation fails', async () => {
      mockRoleValidator.createUpdateRoleValidator.mockReturnValue({ success: false, error: { issues: [{ message: 'Validation error' }] } } as any);
      await expect(roleService.createRole(validRole as any)).rejects.toThrow('Validation error');
    });
  });

  describe('updateRole', () => {
    const validRole = { type: 'ADMIN', description: 'desc', isActive: true };
    it('should update role if found', async () => {
      mockRoleValidator.createUpdateRoleValidator.mockReturnValue({ success: true, data: validRole } as any);
      mockBaseRepo.updateById.mockResolvedValue({ id: 'roleId' } as any);
      const result = await roleService.updateRole('roleId', validRole as any);
      expect(mockBaseRepo.updateById).toHaveBeenCalledWith(expect.anything(), 'roleId', validRole);
      expect(result).toEqual({ status: true, id: 'roleId' });
    });
    it('should throw if update fails', async () => {
      mockRoleValidator.createUpdateRoleValidator.mockReturnValue({ success: true, data: validRole } as any);
      mockBaseRepo.updateById.mockResolvedValue(null);
      await expect(roleService.updateRole('roleId', validRole as any)).rejects.toThrow('update fail');
    });
  });

  describe('softDelete', () => {
    it('should soft delete if role not in use', async () => {
      mockUserRepo.findByRole.mockResolvedValue(null);
      mockBaseRepo.softDeleteById.mockResolvedValue({} as any);
      const result = await roleService.softDelete('roleId');
      expect(mockUserRepo.findByRole).toHaveBeenCalledWith('roleId');
      expect(mockBaseRepo.softDeleteById).toHaveBeenCalledWith(expect.anything(), 'roleId');
      expect(result).toEqual({ status: true });
    });
    it('should throw if role is in use', async () => {
      mockUserRepo.findByRole.mockResolvedValue({ id: 'user1' } as any);
      await expect(roleService.softDelete('roleId')).rejects.toThrow('This Role is already in use');
    });
  });
}); 