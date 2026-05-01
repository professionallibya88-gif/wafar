import { fn, col, Op } from 'sequelize';
import { BaseRepository } from './BaseRepository';
import { PDFFile } from '../database/models/PDFFile';
import { Supplier } from '../database/models/Supplier';
import { User } from '../database/models/User';

export class PDFFileRepository extends BaseRepository<PDFFile> {
  constructor() {
    super(PDFFile);
  }

  async findByUserWithPagination(options: {
    userId: string;
    status?: string;
    limit: number;
    offset: number;
  }): Promise<{ rows: PDFFile[]; count: number }> {
    const { userId, status, limit, offset } = options;
    const where: any = { user_id: userId };
    if (status) where.status = status;

    return this.model.findAndCountAll({
      where,
      include: [{ model: Supplier, as: 'supplier', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<PDFFile | null> {
    return this.model.findOne({
      where: { id, user_id: userId },
      include: [{ model: Supplier, as: 'supplier', attributes: ['id', 'name'] }],
    });
  }

  async findByIdAndUserSimple(id: string, userId: string): Promise<PDFFile | null> {
    return this.model.findOne({ where: { id, user_id: userId } });
  }

  async findAllWithPagination(options: {
    limit: number;
    offset: number;
    status?: string;
    search?: string;
  }): Promise<{ rows: PDFFile[]; count: number }> {
    const { limit, offset, status, search } = options;
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { original_name: { [Op.iLike]: `%${search}%` } },
        { processing_method: { [Op.iLike]: `%${search}%` } },
        { '$user.full_name$': { [Op.iLike]: `%${search}%` } },
        { '$user.phone$': { [Op.iLike]: `%${search}%` } },
        { '$supplier.name$': { [Op.iLike]: `%${search}%` } },
      ];
    }

    return this.model.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'phone'] },
        { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
      ],
      distinct: true,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
  }

  async findCatalogsWithPagination(options: {
    limit: number;
    offset: number;
    status?: string;
    latestOnly?: boolean;
  }): Promise<{ rows: PDFFile[]; count: number }> {
    const { limit, offset, status, latestOnly } = options;
    const where: any = {};
    if (status) where.status = status;
    if (latestOnly) where.is_latest_version = true;

    return this.model.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'phone'] },
        { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'category'] },
      ],
      order: [
        ['document_date', 'DESC'],
        ['created_at', 'DESC'],
      ],
      limit,
      offset,
    });
  }

  async findVersionsBySupplier(supplierId: string): Promise<PDFFile[]> {
    return this.model.findAll({
      where: { supplier_id: supplierId },
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name'] }],
      order: [
        ['document_date', 'DESC'],
        ['version_number', 'DESC'],
      ],
    });
  }

  async markPreviousVersionsAsOld(supplierId: string, excludeId: string): Promise<number> {
    const result = await this.model.update(
      { is_latest_version: false },
      { where: { supplier_id: supplierId, id: { [Op.ne]: excludeId } } }
    );
    return result[0];
  }

  async getMethodStats(): Promise<any[]> {
    return this.model.findAll({
      attributes: [
        'processing_method',
        [fn('COUNT', col('id')), 'count'],
        [fn('AVG', col('parts_count')), 'avg_parts'],
      ],
      where: { status: 'completed' },
      group: ['processing_method'],
      raw: true,
    });
  }

  async getUserStats(userId: string): Promise<{
    total_files: number;
    processing_files: number;
    completed_files: number;
    total_parts: number;
  }> {
    const baseWhere = { user_id: userId };
    const [totalFiles, processingFiles, completedFiles, totalParts] = await Promise.all([
      this.model.count({ where: baseWhere }),
      this.model.count({ where: { ...baseWhere, status: 'processing' } }),
      this.model.count({ where: { ...baseWhere, status: 'completed' } }),
      this.model.sum('parts_count', { where: baseWhere }),
    ]);

    return {
      total_files: totalFiles,
      processing_files: processingFiles,
      completed_files: completedFiles,
      total_parts: Number(totalParts || 0),
    };
  }
}

export const pdfFileRepository = new PDFFileRepository();
