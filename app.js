var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var mongodb=require('mongodb');
var index = require('./routes/index');
var session = require('express-session');
var app = express();
const router = require('./routes/index');
var users = require('./routes/users');
var multer= require('multer');
var bcrypt=require('bcrypt');
var fs= require('fs');
mongoose.connect('mongodb://localhost/Shopping-Website-1', function(err){
	var db = mongoose.connection;
	if(err){
		db.on('error', console.error.bind(console, "MongoDB connection failed"));
	}
	
	return console.log("Connected to DB");
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"Nishi", resave:false, saveUninitialized:true}));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error();
  err.status = 404;
  console.log(err);
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err);
  res.render('index');
});



module.exports = app;
