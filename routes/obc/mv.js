var Iconv = require('iconv').Iconv;
var util = require('util');
var childProcess = require('child_process');
var exec = util.promisify(childProcess.exec);
var express = require('express');
var router = express.Router();

const CACHE_DIR = process.env.CACHE_DIR_OBC_MV
const WORK_DIR = process.env.RPA_APP_HOME
const BIN = process.env.BIN_OBC_MV
const result = process.env.OUT_OBC_MV
const cmds = [
  `pushd "${WORK_DIR}"&${BIN} /cmd "import;${CACHE_DIR}"`,
  `pushd "${WORK_DIR}"&${BIN} /cmd convert;`,
  `pushd "${WORK_DIR}"&${BIN} /cmd "export;${result}"`,
];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('obc/mv/index', { title: 'Express' });
});

router.ws('/', function(ws, req) {
  ws.on('message', async function(msg) {
    ws.send(JSON.stringify({data: '処理を開始しました！'}));

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
    } catch (err) {
      console.log(err)
    } finally {
      ws.send(JSON.stringify({data: ''}));
    }
  });
});

module.exports = router;
