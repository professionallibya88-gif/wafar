import { BaseRepository } from './BaseRepository';
import { Subscription } from '../database/models/Subscription';
import { SubscriptionPlan } from '../database/models/SubscriptionPlan';

export class SubscriptionRepository extends BaseRepository<Subscription> {
  constructor() {
    super(Subscription);
  }

  async findActiveByUser(userId: string): Promise<Subscription | null> {
    return this.model.findOne({
      where: { user_id: userId, status: 'active' },
      include: [{ model: SubscriptionPlan, as: 'plan' }],
      order: [['created_at', 'DESC']],
    });
  }

  async findAllByUser(userId: string): Promise<Subscription[]> {
    return this.model.findAll({
      where: { user_id: userId },
      include: [{ model: SubscriptionPlan, as: 'plan' }],
      order: [['created_at', 'DESC']],
    });
  }
}

export const subscriptionRepository = new SubscriptionRepository();
