import request from '@/dataroom-packages/_common/_request'

/**
 * 用户状态
 */
export type UserStatus = 'NORMAL' | 'DISABLED' | 'PASSWORD_EXPIRED'

/**
 * 用户实体
 */
export interface UserEntity {
  id?: string
  account: string
  username: string
  password?: string
  phone?: string
  role?: string
  status: UserStatus
  createDate?: string
  updateDate?: string
}

/**
 * 用户查询参数
 */
export interface UserQueryDTO {
  account?: string
  username?: string
  status?: UserStatus
  current?: number
  size?: number
}

/**
 * 用户编辑 DTO
 */
export interface UserDTO {
  id?: string
  account: string
  username: string
  password?: string
  phone?: string
  role?: string
  status: UserStatus
}

/**
 * 角色
 */
export interface Role {
  code: string
  name: string
}

/**
 * 用户 API
 */
export const userApi = {
  /**
   * 分页查询用户
   */
  page(params?: UserQueryDTO) {
    return request.get<{ data: UserEntity[]; total: number }>('/dataRoom/user/page', params)
  },

  /**
   * 获取用户详情
   */
  detail(id: string) {
    return request.get<UserEntity>(`/dataRoom/user/detail/${id}`)
  },

  /**
   * 新增用户
   */
  add(data: UserDTO) {
    return request.post<void>('/dataRoom/user/add', data)
  },

  /**
   * 更新用户
   */
  update(data: UserDTO) {
    return request.post<void>('/dataRoom/user/update', data)
  },

  /**
   * 删除用户
   */
  delete(id: string) {
    return request.post<void>(`/dataRoom/user/delete/${id}`)
  },

  /**
   * 获取所有角色
   */
  roles() {
    return request.get<Role[]>('/dataRoom/user/roles')
  },
}