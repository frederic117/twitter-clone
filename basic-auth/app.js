const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

// Routes
const authRoutes = require('./routes/auth-routes');
const siteRoutes = require('./routes/site-routes');
const tweetsController = require("./routes/tweetsController");
const timelineController = require("./routes/timelineController");
const profileController  = require("./routes/profileController");

// Mongoose configuration
mongoose.connect("mongodb://localhost/insiders");


// Authentication
app.use(session({
    secret: "basic-auth-secret",
    cookie: { maxAge: 60000 },
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 24 * 60 * 60 // 1 day
    })
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', authRoutes);
app.use('/', siteRoutes);
app.use("/tweets", tweetsController);
app.use('/timeline', timelineController);
app.use("/profile", profileController);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;