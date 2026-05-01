import { BaseRepository } from './BaseRepository';
import { Payment } from '../database/models/Payment';
import { User } from '../database/models/User';

export class PaymentRepository extends BaseRepository<Payment> {
  constructor() {
    super(Payment);
  }

  async findByUserWithPagination(options: {
    userId: string;
    limit: number;
    offset: number;
  }): Promise<{ rows: Payment[]; count: number }> {
    const { userId, limit, offset } = options;
    return this.model.findAndCountAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
  }

  async findAllWithPagination(options: {
    status?: string;
    limit: number;
    offset: number;
  }): Promise<{ rows: Payment[]; count: number }> {
    const { status, limit, offset } = options;
    const where: any = {};
    if (status) where.status = status;

    return this.model.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'phone'] }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
  }

  async sumApprovedRevenue(): Promise<number> {
    const sum = await this.model.sum('amount', { where: { status: 'approved' } });
    return sum || 0;
  }
}

export const paymentRepository = new PaymentRepository();
