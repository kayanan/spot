import { RoleDTO, RoleModel } from '../data/dtos/role.dto';
import {
  RoleListResponse,
  RoleResponse,
} from '../controller/response/role.response';
import RoleValidator from '../validators/role.validator';
import { ListRequest } from '../../base/controller/request/list.request';
import { CreateUpdateRoleRequest } from '../controller/request/createUpdateRoleRequest';
import {
  BaseResponse,
  CreatedUpdatedResponse,
} from '../../base/controller/responses/base.repsonse';
import UserRepository from '../data/repository/user.repository';

import BaseRepository from '@/modules/base/data/repository/base.repository';

const getRoles = async (
  listReq: ListRequest
): Promise<RoleListResponse> => {
  const query = { isDeleted: false } as any;
  if (listReq.search) {
    query.type = {
      $regex: '.*' + listReq.search ? listReq.search : '.*',
      $options: 'i',
    };
  }
  const roles = await BaseRepository.findAll(
    RoleDTO,
    query,
    listReq.skip,
    listReq.limit
  );
  return {
    status: true,
    totalCount: roles.totalCount,
    roles: roles.items,
  };
};

const getRole = async (id: string): Promise<RoleResponse> => {
  const role: RoleModel | null = await BaseRepository.findById(
    RoleDTO,
    id
  );
  if (!role) throw new Error(`Role not found for id ${id}`);
  return { status: true, role };
};

const createRole = async (
  roleData: CreateUpdateRoleRequest
): Promise<CreatedUpdatedResponse> => {
  const valResult = RoleValidator.createUpdateRoleValidator(roleData);
  if (!valResult.success) {
    throw new Error(valResult?.error.issues[0].message);
  }
  const roleId = await BaseRepository.create(RoleDTO, valResult.data);
  return { status: true, id: roleId };
};

const updateRole = async (
  id: string,
  roleData: CreateUpdateRoleRequest
): Promise<CreatedUpdatedResponse> => {
  RoleValidator.createUpdateRoleValidator(roleData);
  const role: RoleModel | null = await BaseRepository.updateById(
    RoleDTO,
    id,
    roleData
  );
  if (role == null) throw new Error('update fail');
  return { status: true, id: role.id };
};

const softDelete = async (id: string): Promise<BaseResponse> => {
  const checkRole = await UserRepository.findByRole(id);
  if (checkRole !== null)
    throw new Error('This Role is already in use');
  await BaseRepository.softDeleteById(RoleDTO, id);
  return { status: true };
};

export default {
  getRoles,
  getRole,
  createRole,
  updateRole,
  softDelete,
};
