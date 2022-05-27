var fs = require("fs");
var util = require('util');
var express = require('express');
var router = express.Router();
const mkdir = util.promisify(fs.mkdir);
const Helpers = require('../components/Helpers');
const Buying = require('../components/Buying');

router.get('/', function(req, res, next) {
  res.render('obc/buying/index', { title: '仕入CSV変換' });
});

router.ws('/', function(ws, req) {
  ws.on('message', async function(msg) {
    try {
      const tmpdir = Helpers.tmpdir();
      console.log(tmpdir)
      await mkdir(tmpdir);

      // 基幹システムから仕入実績データを取得する。
      var tasks = Buying.halveLastMonth();
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const b = new Buying;
        const response = await b.export({
          directoryToSaveFile: tmpdir,
          span: {
            ...task
          }
        });
        if (response.statusText) {
          ws.send(JSON.stringify({ data: response.statusText }));
        }  
      }

      // TODO: フォーマット変換
      // TODO: 勘定系システムのデータソースとしてCSVファイルを出力する。
    } catch (error) {   
      console.log(error)   
    } finally {
      ws.send(JSON.stringify({data: ''}));
    }
  });
});

module.exports = router;