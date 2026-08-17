import winston from 'winston';
import { config } from './config';

export const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${extra}`;
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/test-run.log' }),
  ],
});

/** Logs a named test step and returns its duration in ms once resolved. */
export async function step<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  logger.info(`STEP START: ${name}`);
  try {
    const result = await fn();
    logger.info(`STEP DONE: ${name}`, { durationMs: Date.now() - start });
    return result;
  } catch (error) {
    logger.error(`STEP FAILED: ${name}`, { durationMs: Date.now() - start, error: String(error) });
    throw error;
  }
}
