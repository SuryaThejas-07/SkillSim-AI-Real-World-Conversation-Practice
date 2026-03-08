/**
 * Centralized logging utility for error tracking and debugging
 * Sends logs to error tracking service in production
 */

interface LogContext {
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  [key: string]: any;
}

interface LogEntry {
  level: "debug" | "info" | "warn" | "error";
  message: string;
  context?: LogContext;
  timestamp: string;
  stack?: string;
}

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const getLogLevel = (): number => {
  const isDev = import.meta.env.DEV;
  return isDev ? LOG_LEVELS.debug : LOG_LEVELS.warn;
};

const getCurrentContext = (): LogContext => ({
  url: window.location.href,
  userAgent: navigator.userAgent,
  timestamp: new Date().toISOString(),
});

const formatLogMessage = (entry: LogEntry): string => {
  const { level, message, context, timestamp } = entry;
  const contextStr = context ? JSON.stringify(context) : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${
    contextStr ? ` ${contextStr}` : ""
  }`;
};

const sendToErrorTracking = async (entry: LogEntry) => {
  if (import.meta.env.PROD) {
    try {
      // Placeholder for error tracking service (Sentry, LogRocket, etc.)
      // await fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) });
    } catch (err) {
      console.error("Failed to send log to tracking service", err);
    }
  }
};

const log = (
  level: "debug" | "info" | "warn" | "error",
  message: string,
  context?: LogContext
) => {
  if (LOG_LEVELS[level] < getLogLevel()) return;

  const entry: LogEntry = {
    level,
    message,
    context: { ...getCurrentContext(), ...context },
    timestamp: new Date().toISOString(),
  };

  const formatted = formatLogMessage(entry);

  switch (level) {
    case "debug":
      console.debug(formatted);
      break;
    case "info":
      console.info(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "error":
      console.error(formatted);
      sendToErrorTracking(entry);
      break;
  }
};

export const logger = {
  debug: (msg: string, context?: LogContext) => log("debug", msg, context),
  info: (msg: string, context?: LogContext) => log("info", msg, context),
  warn: (msg: string, context?: LogContext) => log("warn", msg, context),
  error: (msg: string, context?: LogContext | Error) => {
    if (context instanceof Error) {
      log("error", msg, {
        errorMessage: context.message,
        stack: context.stack,
      });
    } else {
      log("error", msg, context);
    }
  },
};
