var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    ws.send(msg);
    setTimeout(_ => ws.send('from server'), 3000);
  });
});

module.exports = router;
