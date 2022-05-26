var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('obc/buying/index', { title: '仕入CSV変換' });
});

router.ws('/', function(ws, req) {
  ws.on('message', async function(msg) {
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
    } catch (error) {   
      console.log(error)   
    } finally {
      ws.send(JSON.stringify({data: ''}));
    }
  });
});

module.exports = router;