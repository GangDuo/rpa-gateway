var fs = require("fs");
var path = require('path');
var util = require('util');
const readFile = util.promisify(fs.readFile);
const mkdir = util.promisify(fs.mkdir);
const rmdir = util.promisify(fs.rmdir);
const unlink = util.promisify(fs.unlink);
const readdir = util.promisify(fs.readdir);
var express = require('express');
var router = express.Router();
const MovementExporter = require('../components/MovementExporter');
const Helpers = require('../components/Helpers');
const dayjs = require('dayjs')

const WORK_DIR = process.env.RPA_APP_HOME
const BIN = process.env.BIN_OBC_MV

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('obc/mv/index', { title: '移動CSV変換' });
});

router.ws('/', function(ws, req) {
  ws.on('message', async function(msg) {
    ws.send(JSON.stringify({data: '処理を開始しました！'}));

    const filepath = Helpers.tmpFilepath();
    const tmpdir = Helpers.tmpdir();
    const me = new MovementExporter;
    console.log(tmpdir)
    try {
      await mkdir(tmpdir);
      await me.export(tmpdir, {
        beginDate: dayjs().subtract(1, "month").startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs().subtract(1, "month").endOf('month').format('YYYY-MM-DD'),
      });
      await Helpers.rmPeriodInFilename(tmpdir);
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
      await rmdirX(tmpdir);
      ws.send(JSON.stringify({data: ''}));
    }
  });
});

async function rmdirX(dir) {
  const xs = await readdir(dir)
  for (let i = 0; i < xs.length; i++) {
    await unlink(path.join(dir, xs[i]))
      .catch(e => console.log(e));
  }
  await rmdir(dir)
}

module.exports = router;
