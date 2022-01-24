// *****************************************************************************
// Server.js - This file is the initial starting point for the Node/Express server.
//
// ******************************************************************************
// *** Dependencies
// =============================================================
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { engine } = require('express-handlebars');
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken');
const jwtExp = require('express-jwt');
const rfs = require("rotating-file-stream");
//loging
//const morgan = require('morgan'); // import morgan
var winston = require('./config/log');

// Requiring our models for syncing
var db = require("./models");

// Sets up the Express App
// =============================================================
var app = express();
var PORT = process.env.PORT || 8080;
var secretKey = process.env.SECRET_TOKEN || "YOUR_SECRET_TOKEN";

// MORGAN SETUP
// create a log stream
const rfsStream = rfs.createStream(process.env.LOG_FILE || 'log.txt', {
    size: process.env.LOG_SIZE || '10M',
    interval: process.env.LOG_INTERVAL || '1d',
    compress: 'gzip' // compress rotated files
});

// // if log file defined then use rfs stream else print to console
// app.use(morgan(process.env.LOG_FORMAT || "dev", {
//     stream: process.env.LOG_FILE ? rfsStream : winston.stream
// }));

// if log file is defined then also show logs in console
// else it will use the previous process.stdout to print to console
// if (process.env.LOG_FILE) {
//     app.use(morgan(process.env.LOG_FORMAT || "dev"));
// }


// Set Handlebars as the default templating engine.
app.engine('.hbs', engine({
    extname: '.hbs',
    defaultLayout: "main"
}));
app.set('view engine', '.hbs');


// I don't care about your HTTP Method
app.use(cookieParser(secretKey));

// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
//app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Routes =============================================================

// 0 - AUTH MIDDLEWARE
app.use('/login', require("./routes/login.js"));

// 1 - API MIDDLEWARE
app.use('/api', jwtExp({ secret: secretKey, algorithms: ['HS256'] }));
app.use('/api', require("./routes/api.js"));

// 2 - HOME PAGE MIDDLEWARE
// verify authorization via cookie using express-jwt
app.get('/', jwtExp({
    secret: secretKey,
    algorithms: ['HS256'],
    getToken: function fromCookie(req) {
        if (req.signedCookies) {
            return req.signedCookies.jwtAuthToken;
        }
        return null;
    },
    credentialsRequired: false
}), function (req, res, next) {
    // if user is signed-in, next()
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
});
app.use('/', require("./routes/desktop.js"));

// Static directory
app.use(express.static("./public"));

// Syncing our sequelize models and then starting our express app
db.sequelize.sync({ force: true }).then(function () {
    app.listen(PORT, function () {
        winston.info("App listening on PORT " + PORT);
    });
});