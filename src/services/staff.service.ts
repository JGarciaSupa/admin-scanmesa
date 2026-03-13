import { api } from './api';
import type { ApiResponse } from './tenant.service';

export interface StaffUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'kitchen' | 'waiter';
  isActive: boolean;
  createdAt: string;
}

export interface CreateStaffData {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'kitchen' | 'waiter';
  isActive?: boolean;
}

export interface UpdateStaffData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'kitchen' | 'waiter';
  isActive?: boolean;
}

export const staffService = {
  /**
   * Obtiene todo el personal de un tenant
   */
  async getAll(tenantId: number | string): Promise<ApiResponse<StaffUser[]>> {
    const { data } = await api.get<ApiResponse<StaffUser[]>>(`/admin/tenants/${tenantId}/staff`);
    return data;
  },

  /**
   * Crea un nuevo miembro del personal
   */
  async create(tenantId: number | string, staffData: CreateStaffData): Promise<ApiResponse<StaffUser>> {
    const { data } = await api.post<ApiResponse<StaffUser>>(`/admin/tenants/${tenantId}/staff`, staffData);
    return data;
  },

  /**
   * Actualiza un miembro del personal
   */
  async update(tenantId: number | string, staffId: number, staffData: UpdateStaffData): Promise<ApiResponse<StaffUser>> {
    const { data } = await api.patch<ApiResponse<StaffUser>>(`/admin/tenants/${tenantId}/staff/${staffId}`, staffData);
    return data;
  },

  /**
   * Elimina un miembro del personal
   */
  async delete(tenantId: number | string, staffId: number): Promise<ApiResponse<{ id: number; deleted: boolean }>> {
    const { data } = await api.delete<ApiResponse<{ id: number; deleted: boolean }>>(`/admin/tenants/${tenantId}/staff/${staffId}`);
    return data;
  }
};
