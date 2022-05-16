var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('fmww/returnedGoods/index', { title: '仕入返品' });
});

module.exports = router;
