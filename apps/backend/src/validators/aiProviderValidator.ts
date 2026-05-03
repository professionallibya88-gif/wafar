import { body, param, query } from 'express-validator';

const allowedProviderTypes = ['google', 'openrouter', 'openai', 'anthropic', 'mistral'];

const buildMetadataRule = (optional: boolean) => {
  const chain = body('metadata');
  if (optional) {
    chain.optional();
  }

  return chain.custom((value) => {
    if (typeof value === 'object' && value !== null) {
      return true;
    }

    if (typeof value === 'string') {
      JSON.parse(value);
      return true;
    }

    throw new Error('البيانات الوصفية يجب أن تكون JSON صالحاً');
  });
};

const buildProviderPayloadRules = (optional: boolean) => {
  const nameRule = body('name');
  const providerTypeRule = body('provider_type');
  const apiKeyRule = body('api_key');
  const baseUrlRule = body('base_url');
  const defaultModelRule = body('default_model');
  const enabledRule = body('enabled');
  const priorityRule = body('priority');
  const inputCostRule = body('cost_per_1k_input_tokens');
  const outputCostRule = body('cost_per_1k_output_tokens');
  const rateLimitRule = body('rate_limit_requests_per_minute');
  const timeoutRule = body('timeout_seconds');
  const maxTokensRule = body('max_tokens');
  const temperatureRule = body('temperature');

  if (optional) {
    [
      nameRule,
      providerTypeRule,
      apiKeyRule,
      baseUrlRule,
      defaultModelRule,
      enabledRule,
      priorityRule,
      inputCostRule,
      outputCostRule,
      rateLimitRule,
      timeoutRule,
      maxTokensRule,
      temperatureRule,
    ].forEach((rule) => rule.optional());
  }

  return [
    nameRule
      .notEmpty()
      .withMessage('اسم المزود مطلوب')
      .isString()
      .withMessage('اسم المزود يجب أن يكون نصاً')
      .isLength({ max: 200 })
      .withMessage('اسم المزود لا يجب أن يتجاوز 200 حرف'),
    providerTypeRule
      .notEmpty()
      .withMessage('نوع المزود مطلوب')
      .isIn(allowedProviderTypes)
      .withMessage('نوع المزود غير مدعوم'),
    apiKeyRule.isString().withMessage('مفتاح API يجب أن يكون نصاً'),
    baseUrlRule
      .notEmpty()
      .withMessage('رابط المزود مطلوب')
      .isURL()
      .withMessage('رابط المزود غير صالح'),
    defaultModelRule
      .notEmpty()
      .withMessage('النموذج الافتراضي مطلوب')
      .isString()
      .withMessage('النموذج الافتراضي يجب أن يكون نصاً'),
    enabledRule.optional().isBoolean().withMessage('حالة التفعيل يجب أن تكون منطقية').toBoolean(),
    priorityRule.optional().isInt({ min: 0, max: 999 }).withMessage('الأولوية غير صالحة').toInt(),
    inputCostRule.optional().isFloat({ min: 0 }).withMessage('تكلفة الإدخال غير صالحة').toFloat(),
    outputCostRule.optional().isFloat({ min: 0 }).withMessage('تكلفة الإخراج غير صالحة').toFloat(),
    rateLimitRule
      .optional()
      .isInt({ min: 1, max: 100000 })
      .withMessage('حد الطلبات في الدقيقة غير صالح')
      .toInt(),
    timeoutRule
      .optional()
      .isInt({ min: 1, max: 600 })
      .withMessage('مهلة الاتصال يجب أن تكون بين 1 و 600 ثانية')
      .toInt(),
    maxTokensRule
      .optional()
      .isInt({ min: 1, max: 200000 })
      .withMessage('الحد الأقصى للرموز غير صالح')
      .toInt(),
    temperatureRule
      .optional()
      .isFloat({ min: 0, max: 2 })
      .withMessage('درجة الحرارة يجب أن تكون بين 0 و 2')
      .toFloat(),
    buildMetadataRule(optional),
  ];
};

export const createAIProviderRules = buildProviderPayloadRules(false);

export const updateAIProviderRules = [
  param('id').isUUID().withMessage('معرف المزود غير صالح'),
  ...buildProviderPayloadRules(true),
];

export const aiProviderIdRules = [param('id').isUUID().withMessage('معرف المزود غير صالح')];

export const aiProviderLogsRules = [
  param('id').isUUID().withMessage('معرف المزود غير صالح'),
  query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('قيمة limit غير صالحة').toInt(),
  query('offset')
    .optional()
    .isInt({ min: 0, max: 100000 })
    .withMessage('قيمة offset غير صالحة')
    .toInt(),
];
