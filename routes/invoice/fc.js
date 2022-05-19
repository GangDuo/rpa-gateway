var fs = require("fs");
var util = require('util');
var express = require('express');
var router = express.Router();
const mkdir = util.promisify(fs.mkdir);
const { FmClient, PurchaseHistory } = require('fmww-library');
const Helpers = require('../components/Helpers');

router.get('/', function(req, res, next) {
  res.render('invoice/fc/index', { title: 'FC請求書' });
});

router.ws('/', function(ws, req) {
  ws.on('message', async function(msg) {
    try {
      const tmpdir = Helpers.tmpdir();
      console.log(tmpdir)
      await mkdir(tmpdir);

      // 基幹システムから仕入実績データを取得する。
      const client = new FmClient()
      await client
        .open(process.env.FMWW_SIGN_IN_URL)
        .signIn({
          FMWW_ACCESS_KEY_ID     : process.env.FMWW_ACCESS_KEY_ID,
          FMWW_USER_NAME         : process.env.FMWW_USER_NAME,
          FMWW_SECRET_ACCESS_KEY : process.env.FMWW_SECRET_ACCESS_KEY,
          FMWW_PASSWORD          : process.env.FMWW_PASSWORD
        })
        .createAbility(PurchaseHistory)
      const response = await client.search({
        directoryToSaveFile: tmpdir,
        span: {
          begin: '2022年03月01日',
          end: '2022年03月01日'
        }
      })
      await client.quit()
      if(response.statusText) {
        ws.send(JSON.stringify({data: response.statusText}));
      }

      // TODO: データ変換
      // TODO: 勘定系システムのデータソースとしてテキストファイルを出力する。
    } catch (error) {   
      console.log(error)   
    } finally {
      ws.send(JSON.stringify({data: ''}));
    }
  });
});

module.exports = router;
