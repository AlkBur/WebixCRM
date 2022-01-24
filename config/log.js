const { dirname } = require('path');
const winston = require('winston');

const appRoot = dirname(require.main.filename);

// define the custom settings for each transport (file, console)
var options = {
    file: {
        level: 'info',
        filename: `${appRoot}/logs/app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
        timestamp: new Date(),
        format: winston.format.combine(
            // add a timestamp
            winston.format.timestamp(),
            // use JSON form
            winston.format.json()
        )
    },
    http: {
        // create a logging target for HTTP logs
        filename: `${appRoot}/logs/http.log`,
        level: "http",
        // process only HTTP logs
        format: filter("http"),

    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    },
};
// instantiate a new Winston Logger with the settings defined above
var logger = new winston.createLogger({
    transports: [
        new winston.transports.File(options.file),
        new winston.transports.File(options.http),
        new winston.transports.Console(options.console)
    ],
    exitOnError: false, // do not exit on handled exceptions
});
// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    write: function (message, encoding) {
        // use the 'info' log level so the output will be picked up by both transports (file and console)
        logger.info(message);
    },
};
module.exports = logger;