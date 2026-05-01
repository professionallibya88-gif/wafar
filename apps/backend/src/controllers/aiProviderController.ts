import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { success, created } from '../utils/ApiResponse';
import { aiProviderService } from '../services/AIProviderService';
import { aiProviderRepository, aiProcessingLogRepository } from '../repositories';
import { NotFoundError } from '../errors';

/**
 * قائمة مزودي الذكاء الاصطناعي
 */
export const listProviders = asyncHandler(async (_req: Request, res: Response) => {
  const providers = await aiProviderRepository.findAll();
  return success(res, {
    data: providers,
    meta: { total: providers.length },
  });
});

/**
 * تفاصيل مزود واحد
 */
export const getProvider = asyncHandler(async (req: Request, res: Response) => {
  const provider = await aiProviderRepository.findById(req.params.id as string);
  if (!provider) throw new NotFoundError('المزود غير موجود');
  return success(res, { data: provider });
});

/**
 * إنشاء مزود جديد
 */
export const createProvider = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;
  const provider = await aiProviderRepository.create(data);
  return created(res, { data: provider, message: 'تم إنشاء المزود بنجاح' });
});

/**
 * تحديث مزود
 */
export const updateProvider = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const provider = await aiProviderRepository.updateById(id, req.body);
  if (!provider) throw new NotFoundError('المزود غير موجود');
  return success(res, { data: provider, message: 'تم تحديث المزود بنجاح' });
});

/**
 * حذف مزود
 */
export const deleteProvider = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const deleted = await aiProviderRepository.deleteById(id);
  if (!deleted) throw new NotFoundError('المزود غير موجود');
  return success(res, { message: 'تم حذف المزود بنجاح' });
});

/**
 * اختبار اتصال مزود
 */
export const testProvider = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await aiProviderService.testProvider(id);
  return success(res, {
    data: result,
    message: result.success ? 'الاتصال ناجح' : 'فشل الاتصال',
  });
});

/**
 * إحصائيات المزودين واستخداماتهم
 */
export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await aiProviderService.getDashboardStats();
  return success(res, { data: stats });
});

/**
 * سجلات معالجة مزود محدد
 */
export const getProviderLogs = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;
  const result = await aiProcessingLogRepository.findByProvider(id, limit, offset);
  return success(res, { data: result.rows, meta: { total: result.count, limit, offset } });
});

/**
 * إضافة مزود افتراضي (seed)
 */
export const seedDefaults = asyncHandler(async (_req: Request, res: Response) => {
  const defaults = [
    {
      name: 'Google Gemini',
      provider_type: 'google',
      api_key: '',
      base_url: 'https://generativelanguage.googleapis.com/v1beta',
      default_model: 'gemini-1.5-flash',
      enabled: false,
      priority: 1,
      cost_per_1k_input_tokens: 0.0,
      cost_per_1k_output_tokens: 0.0,
      rate_limit_requests_per_minute: 60,
      timeout_seconds: 60,
      max_tokens: 4096,
      temperature: 0.1,
      metadata: '{}',
    },
    {
      name: 'OpenRouter (Free)',
      provider_type: 'openrouter',
      api_key: '',
      base_url: 'https://openrouter.ai/api/v1',
      default_model: 'google/gemini-2.0-flash-exp:free',
      enabled: false,
      priority: 2,
      cost_per_1k_input_tokens: 0.0,
      cost_per_1k_output_tokens: 0.0,
      rate_limit_requests_per_minute: 20,
      timeout_seconds: 60,
      max_tokens: 4096,
      temperature: 0.1,
      metadata: '{}',
    },
    {
      name: 'OpenAI',
      provider_type: 'openai',
      api_key: '',
      base_url: 'https://api.openai.com/v1',
      default_model: 'gpt-4o-mini',
      enabled: false,
      priority: 3,
      cost_per_1k_input_tokens: 0.00015,
      cost_per_1k_output_tokens: 0.0006,
      rate_limit_requests_per_minute: 60,
      timeout_seconds: 60,
      max_tokens: 4096,
      temperature: 0.1,
      metadata: '{}',
    },
    {
      name: 'Anthropic Claude',
      provider_type: 'anthropic',
      api_key: '',
      base_url: 'https://api.anthropic.com/v1',
      default_model: 'claude-3-haiku-20240307',
      enabled: false,
      priority: 4,
      cost_per_1k_input_tokens: 0.00025,
      cost_per_1k_output_tokens: 0.00125,
      rate_limit_requests_per_minute: 60,
      timeout_seconds: 60,
      max_tokens: 4096,
      temperature: 0.1,
      metadata: '{}',
    },
    {
      name: 'Mistral AI',
      provider_type: 'mistral',
      api_key: '',
      base_url: 'https://api.mistral.ai/v1',
      default_model: 'mistral-small-latest',
      enabled: false,
      priority: 5,
      cost_per_1k_input_tokens: 0.0002,
      cost_per_1k_output_tokens: 0.0006,
      rate_limit_requests_per_minute: 60,
      timeout_seconds: 60,
      max_tokens: 4096,
      temperature: 0.1,
      metadata: '{}',
    },
  ];

  let created = 0;
  for (const def of defaults) {
    const exists = await aiProviderRepository.findOne({ provider_type: def.provider_type });
    if (!exists) {
      await aiProviderRepository.create(def);
      created++;
    }
  }

  return success(res, {
    message: `تم إنشاء ${created} مزود افتراضي`,
    data: { created },
  });
});
