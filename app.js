var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

/*模板引擎*/
var partials = require('express-partials');

//database
var db = require('./models/db')();
global.db = db;

//all routes
var routes = require('./routes/index');
var users = require('./routes/users');
var io = require('socket.io')();
var admin = require('./routes/admin')(io);

var multer = require('multer');
var mongoose = require('mongoose');
var session = require('express-session');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');
app.set('view engine', 'html');
app.engine("html",require("ejs").__express); // or   app.engine("html",require("ejs").renderFile);
app.use(partials());


app.use(session({ 
    secret: 'secret',
    resave: true, 
    saveUninitialized: true,
    cookie:{ 
        maxAge: 1000*60*30,
    }
}));

app.use(function(req,res,next){ 
    res.locals.user = req.session.user;   // 从session 获取 user对象
    var err = req.session.error;   //获取错误信息
    delete req.session.error;
    res.locals.message = "";   // 展示的信息 message
    if(err){ 
        res.locals.message = '<div class="alert alert-danger" style="margin-bottom:20px;color:red;">'+err+'</div>';
    }
    next();  //中间件传递
});


app.use(function(req, res, next){
//    针对注册会员
    res.locals.logined = req.session.logined;
    res.locals.userInfo = req.session.user;
//    针对管理员
    res.locals.adminLogined = req.session.adminLogined;
    res.locals.adminUserInfo = req.session.adminUserInfo;
    res.locals.adminNotices = req.session.adminNotices;
//    指定站点域名
    res.locals.myDomain = req.headers.host;
    next();
});


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(multer());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/login',routes); // 即为为路径 /login 设置路由
app.use('/register',routes); // 即为为路径 /register 设置路由
app.use('/home',routes); // 即为为路径 /home 设置路由
app.use("/logout",routes); // 即为为路径 /logout 设置路由
app.use('/admin', admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  // Disable views cache
  app.set('view cache', false);

  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
