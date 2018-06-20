const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressSession = require('express-session');

require('dotenv').config({ silent: true });

const appRoutes = require('./routes/app');
const twitterRoutes = require('./routes/twitRouter');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

/***********************************************************************************************************************
 * Set up mongoose
 * ********************************************************************************************************************/
const uri = ""; // Insert your MongoDB uri here

mongoose.connect(uri);

/***********************************************************************************************************************
 * Express
 * ********************************************************************************************************************/
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
    next();
});

app.use(expressSession({
    secret: 'IBMSG2018',
    resave: true,
    saveUninitialized: true
}));

// Set up passport for twitter
require('./config/passport')(app);
app.use('/', appRoutes, twitterRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    return res.render('index');
});

module.exports = app;
