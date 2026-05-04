const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3050',
  'http://127.0.0.1:3050',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://wafar-frontend.vercel.app',
  'https://waffer.com',
];

const DEFAULT_ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/wafar-frontend(?:-[\w-]+)?\.vercel\.app$/,
  /^https:\/\/waffer-frontend(?:-[\w-]+)?\.vercel\.app$/,
];

const parseOriginList = (value?: string): string[] =>
  (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const getAllowedOrigins = (): string[] => {
  const envOrigins = [
    ...parseOriginList(process.env.ALLOWED_ORIGINS),
    ...parseOriginList(process.env.CORS_ORIGIN),
    ...parseOriginList(process.env.FRONTEND_URL),
  ];

  return Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...envOrigins]));
};

const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin) {
    return true;
  }

  if (getAllowedOrigins().includes(origin)) {
    return true;
  }

  return DEFAULT_ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
};

const validateCorsOrigin = (
  origin: string | undefined,
  callback: (_error: Error | null, _allow?: boolean) => void
) => {
  if (isAllowedOrigin(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error('Origin غير مسموح'));
};

export { getAllowedOrigins, isAllowedOrigin, validateCorsOrigin };
