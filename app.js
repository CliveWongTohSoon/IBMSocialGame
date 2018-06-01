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
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/user');
const instructionRoutes = require('./routes/instruction');
const startGameRoutes = require('./routes/start');
const twitterRoutes = require('./routes/twitRouter');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

/***********************************************************************************************************************
 * Set up mongoose
 * ********************************************************************************************************************/
const uri = "mongodb://new-user:IBMSG2018@ibmsocialgame-shard-00-00-zpkv9.mongodb.net:27017,ibmsocialgame-shard-00-01-zpkv9.mongodb.net:27017,ibmsocialgame-shard-00-02-zpkv9.mongodb.net:27017/test?ssl=true&replicaSet=IBMSocialGame-shard-0&authSource=admin&retryWrites=true";
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

app.use('/start', startGameRoutes);
app.use('/message', messageRoutes);
app.use('/user', userRoutes);
app.use('/instruction', instructionRoutes);

app.use('/', appRoutes, twitterRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    return res.render('index');
});

module.exports = app;
