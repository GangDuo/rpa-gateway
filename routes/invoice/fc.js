var fs = require("fs");
var path = require('path');
var util = require('util');
var express = require('express');
var router = express.Router();
const dayjs = require('dayjs');
const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const Helpers = require('../components/Helpers');
const Buying = require('../components/Buying');

const WORK_DIR = process.env.RPA_APP_HOME
const BIN = process.env.BIN_INVOICE_FC

router.get('/', function(req, res, next) {
  res.render('invoice/fc/index', { title: 'FC請求書' });
});

router.ws('/', function(ws, req) {
  ws.on('message', async function(msg) {
    var tasks = [
      ...Buying.halveLastMonth(),
      ...Buying.halve(
        dayjs().startOf('month'), 
        dayjs().subtract(1, 'day'))
    ];

    try {
      const tmpdir = Helpers.tmpdir();
      console.log(tmpdir)
      await mkdir(tmpdir);

      // 基幹システムから仕入実績データを取得する。
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

      // 勘定系システムのデータソースとしてテキストファイルを出力する。
      const filepath = Helpers.tmpFilepath('.txt');
      console.log(filepath)
      await Helpers.execCmds([
        `pushd "${WORK_DIR}"&${BIN} /cmd "import;${tmpdir}"`,
        `pushd "${WORK_DIR}"&${BIN} /cmd convert;`,
        `pushd "${WORK_DIR}"&${BIN} /cmd "export;${filepath}"`,
      ]);

      let base64 = await readFile(filepath, {encoding: "base64"})
      ws.send(JSON.stringify({data: `<a download="${path.basename(filepath)}" href="data:application/octet-stream;base64,${base64}">ダウンロード</a>`}));
    } catch (error) {   
      console.log(error)   
    } finally {
      ws.send(JSON.stringify({data: ''}));
    }
  });
});

module.exports = router;