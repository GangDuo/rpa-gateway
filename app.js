var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();
var expressWs = require('express-ws')(app);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var obcMvRouter = require('./routes/obc/mv');
var obcBuyingRouter = require('./routes/obc/buying');
var returnedGoodsRouter = require('./routes/fmww/returnedGoods');
var wasteRouter = require('./routes/fmww/waste');
var fcInvoiceRouter = require('./routes/invoice/fc');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/obc/mv', obcMvRouter);
app.use('/obc/buying', obcBuyingRouter);
app.use('/fmww/returnedGoods', returnedGoodsRouter);
app.use('/fmww/waste', wasteRouter);
app.use('/invoice/fc', fcInvoiceRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
