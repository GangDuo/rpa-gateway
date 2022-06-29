var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('fmww/waste/index', { title: '廃棄金額' });
});

router.ws('/', function(ws, req) {
  ws.on('message', async function(msg) {
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {   
      console.log(error)   
    } finally {
      ws.send(JSON.stringify({data: ''}));
    }
  });
});

module.exports = router;
