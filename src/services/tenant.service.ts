import { api } from './api';

// ============================================================================
// TIPOS
// ============================================================================

export interface Plan {
  id: number;
  name: string;
  price: {
    monthly: number;
    annual: number;
    currency: string;
  };
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: number;
  name: string;
  documentId: string;
  schemaName: string;
  isActive: boolean;
  planId: number | null;
  createdAt: string;
  updatedAt: string;
  plan?: {
    id: number;
    name: string;
    price: {
      monthly: number;
      annual: number;
      currency: string;
    };
  };
}

export interface CreateTenantData {
  name: string;
  documentId: string;
  schemaName: string;
  planId?: number;
  isActive?: boolean;
}

export interface UpdateTenantData {
  name?: string;
  documentId?: string;
  planId?: number | null;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

// ============================================================================
// SERVICIOS DE TENANTS
// ============================================================================

export const tenantService = {
  /**
   * Obtiene todos los tenants con paginación y filtros
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Tenant>> {
    const { data } = await api.get<PaginatedResponse<Tenant>>('/admin/tenants', {
      params,
    });
    return data;
  },

  /**
   * Obtiene un tenant por ID
   */
  async getById(id: number): Promise<ApiResponse<Tenant>> {
    const { data } = await api.get<ApiResponse<Tenant>>(`/admin/tenants/${id}`);
    return data;
  },

  /**
   * Crea un nuevo tenant
   */
  async create(tenantData: CreateTenantData): Promise<ApiResponse<Tenant>> {
    const { data } = await api.post<ApiResponse<Tenant>>('/admin/tenants', tenantData);
    return data;
  },

  /**
   * Actualiza un tenant existente
   */
  async update(id: number, tenantData: UpdateTenantData): Promise<ApiResponse<Tenant>> {
    const { data } = await api.patch<ApiResponse<Tenant>>(`/admin/tenants/${id}`, tenantData);
    return data;
  },

  /**
   * Desactiva un tenant (soft delete)
   */
  async delete(id: number): Promise<ApiResponse<Tenant>> {
    const { data } = await api.delete<ApiResponse<Tenant>>(`/admin/tenants/${id}`);
    return data;
  },

  /**
   * Elimina permanentemente un tenant
   */
  async hardDelete(id: number): Promise<ApiResponse<{ id: number; deleted: boolean }>> {
    const { data } = await api.delete<ApiResponse<{ id: number; deleted: boolean }>>(
      `/admin/tenants/${id}/hard`
    );
    return data;
  },
};

// ============================================================================
// SERVICIOS DE PLANS
// ============================================================================

export const planService = {
  /**
   * Obtiene todos los planes con paginación
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Plan>> {
    const { data } = await api.get<PaginatedResponse<Plan>>('/admin/plans', {
      params,
    });
    return data;
  },

  /**
   * Obtiene todos los planes activos (sin paginación)
   */
  async getActive(): Promise<ApiResponse<Plan[]>> {
    const { data } = await api.get<ApiResponse<Plan[]>>('/admin/plans/active');
    return data;
  },

  /**
   * Obtiene un plan por ID
   */
  async getById(id: number): Promise<ApiResponse<Plan>> {
    const { data } = await api.get<ApiResponse<Plan>>(`/admin/plans/${id}`);
    return data;
  },

  /**
   * Crea un nuevo plan
   */
  async create(planData: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Plan>> {
    const { data } = await api.post<ApiResponse<Plan>>('/admin/plans', planData);
    return data;
  },

  /**
   * Actualiza un plan existente
   */
  async update(id: number, planData: Partial<Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<Plan>> {
    const { data } = await api.patch<ApiResponse<Plan>>(`/admin/plans/${id}`, planData);
    return data;
  },

  /**
   * Elimina un plan
   */
  async delete(id: number): Promise<ApiResponse<{ id: number; deleted: boolean }>> {
    const { data } = await api.delete<ApiResponse<{ id: number; deleted: boolean }>>(`/admin/plans/${id}`);
    return data;
  },
};
