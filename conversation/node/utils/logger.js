const { createLogger, format, transports, config } = require('winston')

const logFormat = format.combine(
    format.colorize(),
    format.timestamp(),
    format.align(),
    format.printf(
        (info) =>
            `${info.timestamp} ${info.level}: ${info.message} ${
                process.env.SESSION_ID ? '(avatarSessionId: ' + process.env.SESSION_ID + ')' : ''
            }`
    )
)

const logger = createLogger({
    format: logFormat,
    transports: [new transports.Console({ level: process.env.LOG_LEVEL })],
})

module.exports = logger
