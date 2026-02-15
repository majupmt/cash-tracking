type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  const line = JSON.stringify(entry);
  
  // Force flush with unbuffered output
  const colorCodes = {
    info: '\x1b[36m',    // cyan
    warn: '\x1b[33m',    // yellow
    error: '\x1b[31m',   // red
    debug: '\x1b[35m',   // magenta
  };
  const resetCode = '\x1b[0m';
  const colored = `${colorCodes[level]}[${level.toUpperCase()}]${resetCode} ${line}`;
  
  // Use write directly to stderr/stdout to bypass buffering
  if (level === 'error') {
    Bun.stderr.write(colored + '\n');
  } else {
    Bun.stdout.write(colored + '\n');
  }
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
};
