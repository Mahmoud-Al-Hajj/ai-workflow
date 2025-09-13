import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

export default logger;

//from google search
// import { createLogger, format, transports } from 'winston';
// const logger = createLogger({
//   level: 'info',
//   format: format.combine(
//     format.colorize(),
//     format.timestamp(),
//     format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
//   ),
//   transports: [
//     new transports.Console(),
//     new transports.File({ filename: 'app.log' })
//   ]
// });

// module.exports = logger;
