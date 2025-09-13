// Update your logger.js with these enhancements:
import winston from "winston";
import path from "path";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }), // Include stack traces
    winston.format.json(),
    winston.format.printf(
      ({ timestamp, level, message, service, userId, workflowId, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          message,
          service: service || "ai-workflow",
          ...(userId && { userId }),
          ...(workflowId && { workflowId }),
          ...meta,
        });
      }
    )
  ),
  defaultMeta: { service: "ai-workflow" },
  transports: [
    // Console with colors for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // Separate files for different log levels
    new winston.transports.File({
      filename: path.join("logs", "logs/error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join("logs", "logs/combined.log"),
    }),
    // Security audit log
    new winston.transports.File({
      filename: path.join("logs", "logs/security.log"),
      level: "warn",
    }),
  ],
});

export default logger;
