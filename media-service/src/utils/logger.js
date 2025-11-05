const winston = require("winston");

// Custom format to handle error messages properly
const customFormat = winston.format.printf(({ level, message, timestamp, service, stack, ...metadata }) => {
  let msg = `${timestamp} [${service}] ${level}: ${message}`;

  // Add stack trace if available
  if (stack) {
    msg += `\n${stack}`;
  }

  // Add any additional metadata
  const metaKeys = Object.keys(metadata);
  if (metaKeys.length > 0) {
    msg += `\n${JSON.stringify(metadata, null, 2)}`;
  }

  return msg;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat()
  ),
  defaultMeta: { service: "media-service" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      ),
    }),
    new winston.transports.File({
      filename: "error.log",
      level: "error",
      format: winston.format.combine(
        winston.format.json()
      )
    }),
    new winston.transports.File({
      filename: "combined.log",
      format: winston.format.combine(
        winston.format.json()
      )
    })
  ],
});

module.exports = logger;
