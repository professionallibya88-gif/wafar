import { supplierRepository } from '../repositories';
import { NotFoundError, ValidationError } from '../errors';

interface SupplierRecord {
  id: string;
  name: string;
  user_id?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  category?: string | null;
  is_active?: boolean;
}

interface SupplierPayload {
  name?: string | null;
  user_id?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  category?: string | null;
  is_active?: boolean;
  [key: string]: unknown;
}

interface ListOptions {
  category?: string;
  limit: number;
  offset: number;
}

/**
 * خدمة الموردين
 */
export class SupplierService {
  /**
   * قائمة الموردين النشطين
   */
  async list({ category, limit, offset }: ListOptions) {
    return supplierRepository.findActiveWithPagination({ category, limit, offset });
  }

  /**
   * جلب مورد بالمعرف
   */
  async getById(id: string): Promise<SupplierRecord> {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) throw new NotFoundError('الشركة غير موجودة');
    return supplier;
  }

  /**
   * إنشاء مورد (للإدارة)
   */
  async create(data: SupplierPayload): Promise<SupplierRecord> {
    const normalizedName = data.name?.trim();
    if (!normalizedName) {
      throw new ValidationError('اسم الشركة الموردة مطلوب');
    }

    const existingSupplier = await supplierRepository.findByName(normalizedName, data.user_id);
    if (existingSupplier) {
      return existingSupplier;
    }

    return supplierRepository.create({
      ...data,
      name: normalizedName,
    });
  }

  /**
   * تحديث مورد (للإدارة)
   */
  async update(id: string, data: Partial<SupplierPayload>): Promise<SupplierRecord> {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) throw new NotFoundError('الشركة غير موجودة');
    const allowed: Array<keyof SupplierPayload> = [
      'name',
      'phone',
      'email',
      'address',
      'category',
      'is_active',
    ];
    const updateData: Record<string, unknown> = {};
    for (const key of allowed) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }
    const updatedSupplier = await supplierRepository.updateById(id, updateData);
    if (!updatedSupplier) throw new NotFoundError('الشركة غير موجودة');
    return updatedSupplier;
  }

  /**
   * حذف مورد (للإدارة)
   */
  async delete(id: string) {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) throw new NotFoundError('الشركة غير موجودة');
    await supplierRepository.deleteById(id);
  }
}

export const supplierService = new SupplierService();
