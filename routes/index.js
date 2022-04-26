var util = require('util');
var childProcess = require('child_process');
var exec = util.promisify(childProcess.exec);
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    ws.send('処理を開始しました！');

    exec(`nslookup yahoo.co.jp`)
    .then(({stdout, stderr}) => {
      console.log(stdout);
      ws.send(stdout);
    })
    .catch(err => {
      console.log(err)
      ws.send(err.message)
    })
  });
});

module.exports = router;
