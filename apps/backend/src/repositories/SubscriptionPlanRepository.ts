import { BaseRepository } from './BaseRepository';
import { SubscriptionPlan } from '../database/models/SubscriptionPlan';

export class SubscriptionPlanRepository extends BaseRepository<SubscriptionPlan> {
  constructor() {
    super(SubscriptionPlan);
  }

  async findAllOrdered(): Promise<SubscriptionPlan[]> {
    return this.model.findAll({
      order: [
        ['sort_order', 'ASC'],
        ['created_at', 'ASC'],
      ],
    });
  }

  async findActiveOrdered(): Promise<SubscriptionPlan[]> {
    return this.model.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC']],
    });
  }
}

export const subscriptionPlanRepository = new SubscriptionPlanRepository();
