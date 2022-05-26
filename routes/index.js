var Iconv = require('iconv').Iconv;
var util = require('util');
var childProcess = require('child_process');
var exec = util.promisify(childProcess.exec);
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'RPAポータル' });
});

router.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    ws.send(JSON.stringify({data: '処理を開始しました！'}));

    const iconv = new Iconv('SHIFT_JIS', 'UTF-8')
    exec(`nslookup yahoo.co.jp`, {encoding: 'Shift_JIS'})
    .then(({stdout, stderr}) => {
      ws.send(JSON.stringify({data: iconv.convert(stdout).toString()}));
    })
    .catch(err => {
      console.log(err)
      ws.send(JSON.stringify({data: err.message}))
    })
  });
});

module.exports = router;
