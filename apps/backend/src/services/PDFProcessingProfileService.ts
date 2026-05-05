import { systemSettingRepository } from '../repositories';
import { PythonPDFProcessor } from './PythonPDFProcessor';

export const PDF_METHODS = [
  'node_pdf',
  'python_pypdf',
  'python_ai',
  'aws_textract',
  'ocr',
] as const;

export const PYTHON_TABLE_ENGINES = ['auto', 'pymupdf', 'pdfplumber', 'camelot'] as const;

type PdfMethod = (typeof PDF_METHODS)[number];
type PythonTableEngine = (typeof PYTHON_TABLE_ENGINES)[number];

export interface PDFProcessingProfile {
  requestedMethod: PdfMethod;
  defaultMethod: PdfMethod;
  tableEngine: PythonTableEngine;
  fallbackChain: PdfMethod[];
  enableAutoFallback: boolean;
  enableAiMetadata: boolean;
  enableAiEnrichment: boolean;
  aiEnabled: boolean;
  aiPreferredProvider: string;
  aiFallbackEnabled: boolean;
}

const parseBool = (value: unknown, defaultValue = false): boolean => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return String(value).toLowerCase() === 'true';
};

const normalizeMethod = (value: unknown, fallback: PdfMethod = 'node_pdf'): PdfMethod => {
  const normalizedValue = String(value || '')
    .trim()
    .toLowerCase();
  return (PDF_METHODS.find((method) => method === normalizedValue) || fallback) as PdfMethod;
};

const normalizeTableEngine = (
  value: unknown,
  fallback: PythonTableEngine = 'auto'
): PythonTableEngine => {
  const normalizedValue = String(value || '')
    .trim()
    .toLowerCase();
  return (PYTHON_TABLE_ENGINES.find((engine) => engine === normalizedValue) ||
    fallback) as PythonTableEngine;
};

const parseFallbackChain = (value: unknown, requestedMethod: PdfMethod): PdfMethod[] => {
  const rawItems = String(value || '')
    .split(',')
    .map((item) => normalizeMethod(item, 'node_pdf'))
    .filter(Boolean);

  const uniqueItems = Array.from(new Set(rawItems));

  const withoutRequestedMethod = uniqueItems.filter((method) => method !== requestedMethod);
  if (withoutRequestedMethod.length > 0) {
    return withoutRequestedMethod;
  }

  return PDF_METHODS.filter((method) => method !== requestedMethod);
};

const isPythonMethod = (method: PdfMethod): boolean =>
  method === 'python_pypdf' || method === 'python_ai';

export class PDFProcessingProfileService {
  async getProfile(requestedMethod?: string): Promise<PDFProcessingProfile> {
    const [
      defaultMethod,
      tableEngine,
      fallbackChain,
      enableAutoFallback,
      enableAiMetadata,
      enableAiEnrichment,
      aiEnabled,
      aiPreferredProvider,
      aiFallbackEnabled,
    ] = await Promise.all([
      systemSettingRepository.getValueByKey('default_pdf_method', 'python_pypdf'),
      systemSettingRepository.getValueByKey('python_table_engine_default', 'auto'),
      systemSettingRepository.getValueByKey('pdf_fallback_chain', 'python_pypdf,node_pdf,ocr'),
      systemSettingRepository.getValueByKey('pdf_enable_auto_fallback', 'true'),
      systemSettingRepository.getValueByKey('pdf_enable_ai_metadata', 'true'),
      systemSettingRepository.getValueByKey('pdf_enable_ai_enrichment', 'false'),
      systemSettingRepository.getValueByKey('ai_enabled', 'false'),
      systemSettingRepository.getValueByKey('ai_preferred_provider', 'google'),
      systemSettingRepository.getValueByKey('ai_fallback_enabled', 'true'),
    ]);

    const normalizedDefaultMethod = normalizeMethod(defaultMethod, 'python_pypdf');
    let normalizedRequestedMethod = normalizeMethod(requestedMethod, normalizedDefaultMethod);
    let effectiveDefaultMethod = normalizedDefaultMethod;
    let effectiveFallbackChain = parseFallbackChain(fallbackChain, normalizedRequestedMethod);

    const shouldCheckPythonAvailability =
      isPythonMethod(normalizedRequestedMethod) ||
      isPythonMethod(normalizedDefaultMethod) ||
      effectiveFallbackChain.some((method) => isPythonMethod(method));

    if (shouldCheckPythonAvailability) {
      const pythonAvailable = await PythonPDFProcessor.isServiceAvailable();

      if (!pythonAvailable) {
        if (isPythonMethod(normalizedRequestedMethod)) {
          normalizedRequestedMethod = 'node_pdf';
        }

        if (isPythonMethod(effectiveDefaultMethod)) {
          effectiveDefaultMethod = 'node_pdf';
        }

        effectiveFallbackChain = effectiveFallbackChain.filter((method) => !isPythonMethod(method));
      }
    }

    return {
      requestedMethod: normalizedRequestedMethod,
      defaultMethod: effectiveDefaultMethod,
      tableEngine: normalizeTableEngine(tableEngine, 'auto'),
      fallbackChain: effectiveFallbackChain,
      enableAutoFallback: parseBool(enableAutoFallback, true),
      enableAiMetadata: parseBool(enableAiMetadata, true),
      enableAiEnrichment: parseBool(enableAiEnrichment, false),
      aiEnabled: parseBool(aiEnabled, false),
      aiPreferredProvider: String(aiPreferredProvider || 'google'),
      aiFallbackEnabled: parseBool(aiFallbackEnabled, true),
    };
  }
}

export const pdfProcessingProfileService = new PDFProcessingProfileService();
