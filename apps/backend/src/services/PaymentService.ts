import {
  paymentRepository,
  subscriptionPlanRepository,
  subscriptionRepository,
} from '../repositories';
import { NotFoundError, BusinessError } from '../errors';

/**
 * خدمة المدفوعات
 */
export class PaymentService {
  /**
   * إنشاء طلب دفع
   */
  async createPayment(userId: any, { plan_id, payment_method, transaction_reference, notes }: any) {
    const plan = await subscriptionPlanRepository.findById(plan_id);
    if (!plan) throw new NotFoundError('الباقة غير موجودة');

    return paymentRepository.create({
      user_id: userId,
      amount: plan.price,
      currency: plan.currency,
      payment_method,
      payment_details: { plan_id: plan.id },
      transaction_reference: transaction_reference || null,
      notes: notes || null,
      status: 'pending',
    });
  }

  /**
   * شحن كرت
   */
  async rechargeCard(userId: any, { card_number, card_type }: any) {
    const mapping = {
      madar: { method: 'recharge_madar', label: 'مدار' },
      libyana: { method: 'recharge_libyana', label: 'ليبيانا' },
    };
    const info = (mapping as any)[card_type];
    if (!info) throw new BusinessError('نوع الكرت غير صالح');

    return paymentRepository.create({
      user_id: userId,
      amount: 0,
      payment_method: info.method,
      payment_details: { card_number, card_type },
      status: 'pending',
      notes: `شحن كرت ${info.label}`,
    });
  }

  /**
   * قائمة مدفوعات المستخدم
   */
  async listMyPayments({ userId, limit, offset }: any) {
    return paymentRepository.findByUserWithPagination({ userId, limit, offset });
  }

  /**
   * قائمة جميع المدفوعات (للإدارة)
   */
  async listAllPayments({ status, limit, offset }: any) {
    return paymentRepository.findAllWithPagination({ status, limit, offset });
  }

  /**
   * الموافقة على دفعة
   */
  async approvePayment(id: any, reviewerId: any, adminNotes: any) {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw new NotFoundError('الدفعة غير موجودة');
    if (payment.status !== 'pending') {
      throw new BusinessError('تم مراجعة هذه الدفعة مسبقا');
    }

    const updatedPayment = await paymentRepository.updateById(id, {
      status: 'approved',
      reviewed_by: reviewerId,
      reviewed_at: new Date(),
      ...(adminNotes ? { admin_notes: adminNotes } : {}),
    });
    if (!updatedPayment) throw new NotFoundError('الدفعة غير موجودة');

    const planId = payment.payment_details?.plan_id;

    if (payment.subscription_id) {
      const subscription = await subscriptionRepository.findById(payment.subscription_id);
      if (subscription) {
        await subscriptionRepository.updateById(subscription.id, { status: 'active' });
      }
    } else if (planId) {
      const plan = await subscriptionPlanRepository.findById(planId);
      if (!plan) {
        throw new NotFoundError('الباقة المرتبطة بالدفع غير موجودة');
      }

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.duration_days);

      const subscription = await subscriptionRepository.create({
        user_id: payment.user_id,
        plan_id: plan.id,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        auto_renew: false,
      });

      await paymentRepository.updateById(id, {
        subscription_id: subscription.id,
      });
    }

    return (await paymentRepository.findById(id)) || updatedPayment;
  }

  /**
   * رفض دفعة
   */
  async rejectPayment(id: any, reviewerId: any, adminNotes: any) {
    const payment = await paymentRepository.findById(id);
    if (!payment) throw new NotFoundError('الدفعة غير موجودة');
    if (payment.status !== 'pending') {
      throw new BusinessError('تم مراجعة هذه الدفعة مسبقا');
    }

    const updatedPayment = await paymentRepository.updateById(id, {
      status: 'rejected',
      reviewed_by: reviewerId,
      reviewed_at: new Date(),
      ...(adminNotes ? { admin_notes: adminNotes } : {}),
    });
    if (!updatedPayment) throw new NotFoundError('الدفعة غير موجودة');

    return updatedPayment;
  }
}

export const paymentService = new PaymentService();
