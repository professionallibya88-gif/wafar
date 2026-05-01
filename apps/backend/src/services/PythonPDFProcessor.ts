import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import logger from '../config/logger';
import { ExternalServiceError } from '../errors';
import { aiProviderRepository, systemSettingRepository } from '../repositories';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:5051';

interface PythonTableOptions {
  engine?: string;
}

interface PythonProcessOptions {
  mode?: 'python_pypdf' | 'python_ai' | 'enhanced';
  engine?: string;
}

interface MetadataOptions {
  providerType?: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export class PythonPDFProcessor {
  private static async postFile(
    filePath: string,
    endpoint: string,
    timeout = 180000,
    extraFields: Record<string, string> = {}
  ) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    for (const [key, value] of Object.entries(extraFields)) {
      formData.append(key, value);
    }

    const response = await axios.post(`${PYTHON_SERVICE_URL}${endpoint}`, formData, {
      headers: formData.getHeaders(),
      timeout,
    });

    return response.data;
  }

  private static async postJson(
    endpoint: string,
    payload: Record<string, unknown>,
    timeout = 180000
  ) {
    const response = await axios.post(`${PYTHON_SERVICE_URL}${endpoint}`, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout,
    });

    return response.data;
  }

  /**
   * استخراج الجداول من ملف PDF
   * @param {String} filePath - مسار ملف PDF
   * @returns {Promise<Object>} - {tables: [...], count: N}
   */
  static async extractTables(filePath: string, options: PythonTableOptions = {}) {
    try {
      const extraFields: Record<string, string> = {};
      if (options.engine) {
        extraFields.engine = options.engine;
      }

      return await this.postFile(filePath, '/extract-tables', 180000, extraFields);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'خطأ غير معروف';
      logger.error('Table extraction error:', message);
      throw new ExternalServiceError('فشل استخراج الجداول من PDF', { originalError: message });
    }
  }

  /**
   * استخراج النص الوصفي من أول الصفحات لاكتشاف اسم المورد وتاريخ الملف
   */
  static async extractMetadata(filePath: string, options: MetadataOptions = {}) {
    try {
      const preferredProvider = await this.resolveMetadataProviderSettings(options);
      const extraFields: Record<string, string> = {};

      if (preferredProvider.providerType) {
        extraFields.provider_type = preferredProvider.providerType;
      }
      if (preferredProvider.apiKey) {
        extraFields.api_key = preferredProvider.apiKey;
      }
      if (preferredProvider.baseUrl) {
        extraFields.base_url = preferredProvider.baseUrl;
      }
      if (preferredProvider.model) {
        extraFields.model = preferredProvider.model;
      }
      if (preferredProvider.providerType === 'google' && preferredProvider.apiKey) {
        extraFields.gemini_api_key = preferredProvider.apiKey;
      }

      return await this.postFile(filePath, '/extract-metadata', 60000, extraFields);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'خطأ غير معروف';
      logger.error('Metadata extraction error:', message);
      throw new ExternalServiceError('فشل استخراج البيانات الوصفية من PDF', {
        originalError: message,
      });
    }
  }

  /**
   * معالجة PDF عبر خدمة Python
   */
  static async process(filePath: string, options: PythonProcessOptions = {}) {
    const mode = options.mode || 'python_pypdf';

    if (mode === 'python_ai') {
      return this.postJson('/process/ai', { file_path: filePath }, 180000);
    }

    if (mode === 'enhanced') {
      return this.postJson('/process/enhanced', { file_path: filePath }, 180000);
    }

    return this.postJson('/process/pypdf', { file_path: filePath }, 180000);
  }

  static async checkHealth(pythonServiceUrl: string) {
    try {
      const response = await axios.get(`${pythonServiceUrl}/health`, { timeout: 5000 });
      return response.data?.status === 'ok';
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'خطأ غير معروف';
      logger.warn('Python service health check failed:', message);
      return false;
    }
  }

  private static async resolveMetadataProviderSettings(options: MetadataOptions) {
    if (options.apiKey) {
      return {
        providerType: options.providerType || 'google',
        apiKey: options.apiKey,
        baseUrl: options.baseUrl || '',
        model: options.model || '',
      };
    }

    const [aiEnabled, preferredProvider, geminiApiKey] = await Promise.all([
      systemSettingRepository.getValueByKey('ai_enabled', 'false'),
      systemSettingRepository.getValueByKey('ai_preferred_provider', 'google'),
      systemSettingRepository.getValueByKey('gemini_api_key', ''),
    ]);

    if (String(aiEnabled).toLowerCase() === 'true') {
      const preferredMatches = await aiProviderRepository.findByType(String(preferredProvider));
      const supportedProvider = preferredMatches.find((provider) =>
        ['google', 'openrouter'].includes(provider.provider_type)
      );

      if (supportedProvider?.api_key) {
        return {
          providerType: supportedProvider.provider_type,
          apiKey: supportedProvider.api_key,
          baseUrl: supportedProvider.base_url || '',
          model: supportedProvider.default_model || '',
        };
      }
    }

    return {
      providerType: geminiApiKey ? 'google' : '',
      apiKey: geminiApiKey || '',
      baseUrl: '',
      model: '',
    };
  }
}
