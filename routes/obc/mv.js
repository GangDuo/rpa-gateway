var fs = require("fs");
var temp = require('temp');
var path = require('path');
var Iconv = require('iconv').Iconv;
var util = require('util');
var childProcess = require('child_process');
var exec = util.promisify(childProcess.exec);
const readFile = util.promisify(fs.readFile);
var express = require('express');
var router = express.Router();
const { FmClient, MovementExport, Between } = require('fmww-library');
const dayjs = require('dayjs')

const CACHE_DIR = process.env.CACHE_DIR_OBC_MV
const WORK_DIR = process.env.RPA_APP_HOME
const BIN = process.env.BIN_OBC_MV

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('obc/mv/index', { title: 'Express' });
});

router.ws('/', function(ws, req) {
  ws.on('message', async function(msg) {
    ws.send(JSON.stringify({data: '処理を開始しました！'}));

    // TODO: 移動データを基幹システムから取得する。
    const client = new FmClient()
    await client.open(process.env.FMWW_SIGN_IN_URL)
    .signIn({
      FMWW_ACCESS_KEY_ID     : process.env.FMWW_ACCESS_KEY_ID,
      FMWW_USER_NAME         : process.env.FMWW_USER_NAME,
      FMWW_SECRET_ACCESS_KEY : process.env.FMWW_SECRET_ACCESS_KEY,
      FMWW_PASSWORD          : process.env.FMWW_PASSWORD
    })
    .createAbility(MovementExport);

    await client.export({
      directoryToSaveFile: '.',
      between: new Between(
        dayjs().subtract(1, "month").startOf('month').format('YYYY-MM-DD'),
        dayjs().subtract(1, "month").endOf('month').format('YYYY-MM-DD')
      ),
    })
    await client.quit()



    const filepath = temp.path({suffix: '.csv'}).replace(/\.(?=\w+\.csv)/, '_');
    const cmds = [
      `pushd "${WORK_DIR}"&${BIN} /cmd "import;${CACHE_DIR}"`,
      `pushd "${WORK_DIR}"&${BIN} /cmd convert;`,
      `pushd "${WORK_DIR}"&${BIN} /cmd "export;${filepath}"`,
    ];
    const iconv = new Iconv('SHIFT_JIS', 'UTF-8')
    try {
      for (let i = 0; i < cmds.length; i++) {
        const cmd = cmds[i];
        ws.send(JSON.stringify({data: cmd}));
        const {stdout, stderr} = await exec(cmd, {encoding: 'Shift_JIS'})
        if(stdout) {
          console.log(iconv.convert(stdout).toString())
        }
        if(stderr){
          console.log(iconv.convert(stderr).toString())
        }
      }
      let base64 = await readFile(filepath, {encoding: "base64"})
      ws.send(JSON.stringify({data: `<a download="${path.basename(filepath)}" href="data:application/octet-stream;base64,${base64}">ダウンロード</a>`}));
    } catch (err) {
      console.log(err)
    } finally {
      ws.send(JSON.stringify({data: ''}));
    }
  });
});

module.exports = router;
