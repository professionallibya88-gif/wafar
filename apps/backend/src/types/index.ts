import { Request } from 'express';

/**
 * واجهة المستخدم المرفق بالطلب (بدون استيراد من models)
 */
export interface UserInfo {
  id: string;
  full_name: string;
  phone: string;
  password?: string;
  role: 'retailer' | 'supplier';
  is_active: boolean;
  balance: number;
  last_login?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface AdminInfo {
  id: string;
  full_name: string;
  email: string;
  password?: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  is_active: boolean;
  last_login?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination?: string;
  filename?: string;
  path: string;
  size: number;
}

export interface AuthenticatedRequest extends Request {
  user?: UserInfo;
  admin?: AdminInfo;
  file?: UploadedFile;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
  sortField?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SearchFilters {
  q?: string;
  type?: 'code' | 'name' | 'all';
  category?: string;
  brand?: string;
  quality_grade?: 'original' | 'high' | 'medium' | 'low' | 'unspecified';
  supplier_id?: string;
  min_price?: number;
  max_price?: number;
  maker?: string;
  car_model?: string;
}

export interface SmartSearchCriteria {
  maker?: string;
  car_model?: string;
  part_type?: string;
  year?: string;
  side?: string;
}

export interface UserSearchFilters {
  role?: 'retailer' | 'supplier';
  search?: string;
  is_active?: boolean;
}

export interface AuthResponse {
  user: {
    id: string;
    full_name: string;
    phone: string;
    role: 'retailer' | 'supplier';
    is_active: boolean;
    balance: number;
  };
  token: string;
}
