var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('fmww/returnedGoods/index', { title: '仕入返品' });
});

router.ws('/', function(ws, req) {
  ws.on('message', async function(msg) {
    try {
      // TODO: 返品データを取得
      await new Promise(resolve => {
        setTimeout(resolve, 3000)
      })
    } catch (error) {   
      console.log(error)   
    } finally {
      ws.send(JSON.stringify({data: '終了！'}));
      ws.send(JSON.stringify({data: ''}));
    }
  });
});

module.exports = router;
