import axios, { AxiosRequestConfig } from 'axios';
import logger from '../config/logger';
import { aiProviderRepository, aiProcessingLogRepository } from '../repositories';
import { ExternalServiceError, BusinessError, NotFoundError } from '../errors';

interface AIProviderRecord {
  id: string;
  name: string;
  provider_type: string;
  default_model?: string | null;
  timeout_seconds: number;
  base_url?: string | null;
  max_tokens?: number | null;
  temperature?: number | string | null;
  api_key?: string | null;
  failure_count: number;
  success_count: number;
  cost_per_1k_input_tokens?: number | string | null;
  cost_per_1k_output_tokens?: number | string | null;
}

interface AIProviderRequestPayload {
  prompt: string;
  imageBase64?: string;
  mimeType?: string;
  jsonMode?: boolean;
}

interface AIProviderResponse {
  text: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

interface ProcessOptions {
  preferredProvider?: string;
  fallbackEnabled?: boolean;
  operation?: string;
  pdfFileId?: string | null;
}

/**
 * خدمة إدارة مزودي الذكاء الاصطناعي مع دعم متعدد المزودين وتبديل تلقائي (Fallback)
 */
export class AIProviderService {
  private static readonly FAILURE_THRESHOLD = 5;
  private static readonly CIRCUIT_COOLDOWN_MS = 120000;
  private circuitStatus: Map<string, { open: boolean; openedAt: number }> = new Map();

  /**
   * استرجاع جميع المزودين
   */
  async getAllProviders() {
    return await aiProviderRepository.findAll();
  }

  /**
   * استرجاع مزود بالمعرف
   */
  async getProviderById(id: string) {
    const provider = await aiProviderRepository.findById(id);
    if (!provider) throw new NotFoundError('المزود غير موجود');
    return provider;
  }

  /**
   * إنشاء مزود جديد
   */
  async createProvider(data: Record<string, unknown>) {
    return await aiProviderRepository.create(data);
  }

  /**
   * تحديث مزود
   */
  async updateProvider(id: string, data: Record<string, unknown>) {
    const provider = await aiProviderRepository.updateById(id, data);
    if (!provider) throw new NotFoundError('المزود غير موجود');
    return provider;
  }

  /**
   * حذف مزود
   */
  async deleteProvider(id: string) {
    const deleted = await aiProviderRepository.deleteById(id);
    if (!deleted) throw new NotFoundError('المزود غير موجود');
    return deleted;
  }

  /**
   * استرجاع سجلات المعالجة لمزود معين
   */
  async getProviderLogs(id: string, limit: number, offset: number) {
    return await aiProcessingLogRepository.findByProvider(id, limit, offset);
  }

  /**
   * إضافة مزودين افتراضيين (seed)
   */
  async seedDefaults() {
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
    return created;
  }

  /**
   * معالجة طلب عبر أفضل مزود متاح
   */
  async process(
    payload: AIProviderRequestPayload,
    options: ProcessOptions = {}
  ): Promise<AIProviderResponse & { aiProviderId: string }> {
    const {
      preferredProvider,
      fallbackEnabled = true,
      operation = 'unknown',
      pdfFileId = null,
    } = options;

    let providers: AIProviderRecord[] = [];

    if (preferredProvider) {
      providers = await aiProviderRepository.findByType(preferredProvider);
    }

    if (providers.length === 0) {
      providers = await aiProviderRepository.findEnabled(true);
    }

    if (providers.length === 0) {
      throw new BusinessError('لا يوجد مزود ذكاء اصطناعي مفعل في النظام', {
        reason: 'no_ai_providers',
      });
    }

    let lastError: Error | null = null;

    for (const provider of providers) {
      if (!this.isProviderAvailable(provider)) {
        logger.warn(`مزود ${provider.name} (${provider.provider_type}) معطل مؤقتاً بسبب فشل متكرر`);
        continue;
      }

      const startTime = Date.now();
      try {
        const result = await this.callProvider(provider, payload);
        const latencyMs = Date.now() - startTime;

        await aiProviderRepository.updateHealthStatus(provider.id, 'healthy');
        await aiProviderRepository.incrementCounters(provider.id, true);

        const cost = this.calculateCost(result.inputTokens, result.outputTokens, provider);

        await aiProcessingLogRepository.create({
          ai_provider_id: provider.id,
          pdf_file_id: pdfFileId,
          provider_type: provider.provider_type,
          model: result.model || provider.default_model,
          operation,
          status: 'success',
          input_tokens: result.inputTokens,
          output_tokens: result.outputTokens,
          estimated_cost: cost,
          latency_ms: latencyMs,
          request_payload_size: JSON.stringify(payload).length,
          response_payload_size: result.text.length,
          error_message: null,
          metadata: JSON.stringify({ imageIncluded: !!payload.imageBase64 }),
        });

        return {
          ...result,
          aiProviderId: provider.id,
        };
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const latencyMs = Date.now() - startTime;

        await aiProviderRepository.incrementCounters(provider.id, false);
        this.recordFailure(provider);

        await aiProcessingLogRepository.create({
          ai_provider_id: provider.id,
          pdf_file_id: pdfFileId,
          provider_type: provider.provider_type,
          model: provider.default_model,
          operation,
          status: 'failed',
          input_tokens: 0,
          output_tokens: 0,
          estimated_cost: 0,
          latency_ms: latencyMs,
          request_payload_size: JSON.stringify(payload).length,
          response_payload_size: 0,
          error_message: lastError.message,
          metadata: '{}',
        });

        logger.error(`فشل الاتصال بمزود ${provider.name}: ${lastError.message}`);

        if (!fallbackEnabled) {
          break;
        }
      }
    }

    throw new ExternalServiceError('فشل الاتصال بجميع مزودي الذكاء الاصطناعي المتاحين', {
      originalError: lastError?.message || 'unknown',
    });
  }

  /**
   * اختبار توفر مزود
   */
  async testProvider(
    providerId: string
  ): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const provider = await aiProviderRepository.findById(providerId);
    if (!provider) {
      throw new BusinessError('المزود غير موجود');
    }

    const startTime = Date.now();
    try {
      const result = await this.callProvider(provider, {
        prompt: 'Respond with exactly {"status":"ok"} and nothing else.',
        jsonMode: true,
      });
      const latencyMs = Date.now() - startTime;

      const isOk = result.text.toLowerCase().includes('ok') || result.text.includes('"status"');

      await aiProviderRepository.updateHealthStatus(
        providerId,
        isOk ? 'healthy' : 'degraded',
        isOk ? 0 : provider.failure_count + 1,
        isOk ? provider.success_count + 1 : provider.success_count
      );

      return { success: isOk, latencyMs, error: isOk ? undefined : 'استجابة غير متوقعة' };
    } catch (error: unknown) {
      const latencyMs = Date.now() - startTime;
      const message = error instanceof Error ? error.message : String(error);

      await aiProviderRepository.updateHealthStatus(
        providerId,
        'unhealthy',
        provider.failure_count + 1,
        provider.success_count
      );

      return { success: false, latencyMs, error: message };
    }
  }

  /**
   * إحصائيات استخدام المزودين
   */
  async getDashboardStats(): Promise<unknown> {
    const [providerStats, dailyStats, totalCost] = await Promise.all([
      aiProviderRepository.getStats(),
      aiProcessingLogRepository.getDailyStats(7),
      aiProcessingLogRepository.getTotalCost(),
    ]);

    const byProvider = await aiProcessingLogRepository.getStatsByProvider();

    return {
      providers: providerStats,
      usage: {
        daily: dailyStats,
        byProvider,
        totalCost,
      },
      circuitBreakers: Array.from(this.circuitStatus.entries()).map(([key, value]) => ({
        providerType: key,
        open: value.open,
        openedAt: value.openedAt,
      })),
    };
  }

  private async callProvider(
    provider: AIProviderRecord,
    payload: AIProviderRequestPayload
  ): Promise<AIProviderResponse> {
    const config = this.buildAxiosConfig(provider);

    switch (provider.provider_type) {
      case 'openrouter':
        return this.callOpenRouter(provider, payload, config);
      case 'google':
        return this.callGoogle(provider, payload, config);
      case 'openai':
        return this.callOpenAI(provider, payload, config);
      case 'anthropic':
        return this.callAnthropic(provider, payload, config);
      case 'mistral':
        return this.callMistral(provider, payload, config);
      case 'custom':
        return this.callCustom(provider, payload, config);
      default:
        throw new ExternalServiceError(`نوع المزود غير مدعوم: ${provider.provider_type}`);
    }
  }

  private buildAxiosConfig(provider: AIProviderRecord): AxiosRequestConfig {
    return {
      timeout: provider.timeout_seconds * 1000,
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  private callOpenRouter(
    provider: AIProviderRecord,
    payload: AIProviderRequestPayload,
    config: AxiosRequestConfig
  ): Promise<AIProviderResponse> {
    const baseUrl = provider.base_url || 'https://openrouter.ai/api/v1';
    const body: Record<string, unknown> = {
      model: provider.default_model || 'google/gemini-2.0-flash-exp:free',
      messages: [{ role: 'user', content: payload.prompt }],
      max_tokens: provider.max_tokens || 4096,
      temperature: Number(provider.temperature) || 0.1,
    };

    if (payload.imageBase64) {
      body.messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: payload.prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${payload.mimeType || 'image/png'};base64,${payload.imageBase64}`,
              },
            },
          ],
        },
      ];
    }

    return axios
      .post(`${baseUrl}/chat/completions`, body, {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${provider.api_key}`,
          'HTTP-Referer': 'https://waffar.ly',
          'X-Title': 'Waffar PDF AI Processor',
        },
      })
      .then((res) => {
        const choice = res.data.choices?.[0];
        const usage = res.data.usage || {};
        return {
          text: choice?.message?.content || choice?.text || '',
          model: res.data.model || provider.default_model,
          provider: provider.provider_type,
          inputTokens: usage.prompt_tokens || 0,
          outputTokens: usage.completion_tokens || 0,
          latencyMs: 0,
        };
      });
  }

  private callOpenAI(
    provider: AIProviderRecord,
    payload: AIProviderRequestPayload,
    config: AxiosRequestConfig
  ): Promise<AIProviderResponse> {
    const baseUrl = provider.base_url || 'https://api.openai.com/v1';
    const body: Record<string, unknown> = {
      model: provider.default_model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: payload.prompt }],
      max_tokens: provider.max_tokens || 4096,
      temperature: Number(provider.temperature) || 0.1,
    };

    if (payload.jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    if (payload.imageBase64) {
      body.messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: payload.prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${payload.mimeType || 'image/png'};base64,${payload.imageBase64}`,
              },
            },
          ],
        },
      ];
    }

    return axios
      .post(`${baseUrl}/chat/completions`, body, {
        ...config,
        headers: { ...config.headers, Authorization: `Bearer ${provider.api_key}` },
      })
      .then((res) => {
        const usage = res.data.usage || {};
        return {
          text: res.data.choices?.[0]?.message?.content || '',
          model: res.data.model || provider.default_model,
          provider: provider.provider_type,
          inputTokens: usage.prompt_tokens || 0,
          outputTokens: usage.completion_tokens || 0,
          latencyMs: 0,
        };
      });
  }

  private callAnthropic(
    provider: AIProviderRecord,
    payload: AIProviderRequestPayload,
    config: AxiosRequestConfig
  ): Promise<AIProviderResponse> {
    const baseUrl = provider.base_url || 'https://api.anthropic.com/v1';
    const content: Array<Record<string, unknown>> = [{ type: 'text', text: payload.prompt }];

    if (payload.imageBase64) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: payload.mimeType || 'image/png',
          data: payload.imageBase64,
        },
      });
    }

    const body = {
      model: provider.default_model || 'claude-3-haiku-20240307',
      max_tokens: provider.max_tokens || 4096,
      messages: [{ role: 'user', content }],
    };

    return axios
      .post(`${baseUrl}/messages`, body, {
        ...config,
        headers: {
          ...config.headers,
          'x-api-key': provider.api_key,
          'anthropic-version': '2023-06-01',
        },
      })
      .then((res) => {
        const usage = res.data.usage || {};
        const textParts = (res.data.content || [])
          .filter((c: any) => c.type === 'text')
          .map((c: any) => c.text);
        return {
          text: textParts.join(' '),
          model: res.data.model || provider.default_model,
          provider: provider.provider_type,
          inputTokens: usage.input_tokens || 0,
          outputTokens: usage.output_tokens || 0,
          latencyMs: 0,
        };
      });
  }

  private callGoogle(
    provider: AIProviderRecord,
    payload: AIProviderRequestPayload,
    config: AxiosRequestConfig
  ): Promise<AIProviderResponse> {
    const baseUrl = provider.base_url || 'https://generativelanguage.googleapis.com/v1beta';
    const model = provider.default_model || 'gemini-1.5-flash';

    const parts: Array<Record<string, unknown>> = [{ text: payload.prompt }];
    if (payload.imageBase64) {
      parts.push({
        inlineData: {
          mimeType: payload.mimeType || 'image/png',
          data: payload.imageBase64,
        },
      });
    }

    const body = {
      contents: [{ parts }],
      generationConfig: {
        maxOutputTokens: provider.max_tokens || 4096,
        temperature: Number(provider.temperature) || 0.1,
      },
    };

    const url = `${baseUrl}/models/${model}:generateContent?key=${provider.api_key}`;

    return axios.post(url, body, config).then((res) => {
      const candidates = res.data.candidates || [];
      const text = candidates
        .flatMap((c: { content?: { parts?: Array<{ text?: string }> } }) => c.content?.parts || [])
        .map((p: { text?: string }) => p.text || '')
        .join(' ');

      const usage = res.data.usageMetadata || {};

      return {
        text,
        model,
        provider: provider.provider_type,
        inputTokens: usage.promptTokenCount || 0,
        outputTokens: usage.candidatesTokenCount || 0,
        latencyMs: 0,
      };
    });
  }

  private callMistral(
    provider: AIProviderRecord,
    payload: AIProviderRequestPayload,
    config: AxiosRequestConfig
  ): Promise<AIProviderResponse> {
    const baseUrl = provider.base_url || 'https://api.mistral.ai/v1';
    const body = {
      model: provider.default_model || 'mistral-small-latest',
      messages: [{ role: 'user', content: payload.prompt }],
      max_tokens: provider.max_tokens || 4096,
      temperature: Number(provider.temperature) || 0.1,
    };

    return axios
      .post(`${baseUrl}/chat/completions`, body, {
        ...config,
        headers: { ...config.headers, Authorization: `Bearer ${provider.api_key}` },
      })
      .then((res) => {
        const usage = res.data.usage || {};
        return {
          text: res.data.choices?.[0]?.message?.content || '',
          model: res.data.model || provider.default_model,
          provider: provider.provider_type,
          inputTokens: usage.prompt_tokens || 0,
          outputTokens: usage.completion_tokens || 0,
          latencyMs: 0,
        };
      });
  }

  private callCustom(
    provider: AIProviderRecord,
    payload: AIProviderRequestPayload,
    config: AxiosRequestConfig
  ): Promise<AIProviderResponse> {
    if (!provider.base_url) {
      throw new ExternalServiceError('عنوان URL الأساسي مطلوب للمزود المخصص');
    }

    const body = {
      model: provider.default_model,
      messages: [{ role: 'user', content: payload.prompt }],
      max_tokens: provider.max_tokens || 4096,
      temperature: Number(provider.temperature) || 0.1,
    };

    return axios
      .post(`${provider.base_url}/chat/completions`, body, {
        ...config,
        headers: { ...config.headers, Authorization: `Bearer ${provider.api_key}` },
      })
      .then((res) => {
        const usage = res.data.usage || {};
        return {
          text: res.data.choices?.[0]?.message?.content || res.data.choices?.[0]?.text || '',
          model: res.data.model || provider.default_model,
          provider: provider.provider_type,
          inputTokens: usage.prompt_tokens || 0,
          outputTokens: usage.completion_tokens || 0,
          latencyMs: 0,
        };
      });
  }

  private isProviderAvailable(provider: AIProviderRecord): boolean {
    const circuit = this.circuitStatus.get(provider.provider_type);
    if (!circuit) return true;
    if (!circuit.open) return true;
    if (Date.now() - circuit.openedAt > AIProviderService.CIRCUIT_COOLDOWN_MS) {
      this.circuitStatus.delete(provider.provider_type);
      return true;
    }
    return false;
  }

  private recordFailure(provider: AIProviderRecord): void {
    if (provider.failure_count + 1 >= AIProviderService.FAILURE_THRESHOLD) {
      this.circuitStatus.set(provider.provider_type, { open: true, openedAt: Date.now() });
      logger.warn(
        `تم فتح Circuit Breaker للمزود ${provider.name} بسبب ${provider.failure_count + 1} محاولات فاشلة`
      );
    }
  }

  private calculateCost(
    inputTokens: number,
    outputTokens: number,
    provider: AIProviderRecord
  ): number {
    const inputCost = (inputTokens / 1000) * Number(provider.cost_per_1k_input_tokens || 0);
    const outputCost = (outputTokens / 1000) * Number(provider.cost_per_1k_output_tokens || 0);
    return Math.round((inputCost + outputCost) * 100000000) / 100000000;
  }
}

export const aiProviderService = new AIProviderService();
