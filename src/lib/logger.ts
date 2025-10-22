// Lightweight logger wrapper — only logs non-error output in non-production by default
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isProd = process.env.NODE_ENV === 'production';

function shouldLog(level: LogLevel) {
  if (level === 'error') return true; // always log errors
  if (isProd) return false; // suppress debug/info/warn in production
  return true;
}

const logger = {
  debug: (...args: any[]) => {
    if (shouldLog('debug')) console.debug('[DEBUG]', ...args);
  },
  info: (...args: any[]) => {
    if (shouldLog('info')) console.info('[INFO]', ...args);
  },
  warn: (...args: any[]) => {
    if (shouldLog('warn')) console.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    // always print errors
    console.error('[ERROR]', ...args);
  },
};

export default logger;
