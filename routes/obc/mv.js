var fs = require("fs");
var os = require('os');
var temp = require('temp');
var path = require('path');
var Iconv = require('iconv').Iconv;
var util = require('util');
var childProcess = require('child_process');
var exec = util.promisify(childProcess.exec);
const readFile = util.promisify(fs.readFile);
const mkdir = util.promisify(fs.mkdir);
const rmdir = util.promisify(fs.rmdir);
const unlink = util.promisify(fs.unlink);
const readdir = util.promisify(fs.readdir);
const rename = util.promisify(fs.rename);
var express = require('express');
var router = express.Router();
const { FmClient, MovementExport, Between } = require('fmww-library');
const dayjs = require('dayjs')

const CACHE_DIR = process.env.CACHE_DIR_OBC_MV
const WORK_DIR = process.env.RPA_APP_HOME
const BIN = process.env.BIN_OBC_MV

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('obc/mv/index', { title: '移動CSV変換' });
});

router.ws('/', function(ws, req) {
  ws.on('message', async function(msg) {
    ws.send(JSON.stringify({data: '処理を開始しました！'}));

    const filepath = temp.path({suffix: '.csv'}).replace(/\.(?=\w+\.csv)/, '_');
    const tmpdir = path.join(os.tmpdir(), Math.random().toString(36).substring(2));
    console.log(tmpdir)
    try {
      await mkdir(tmpdir);
      await download(tmpdir);
      await rmPeriodInFilename(tmpdir);
      await execCmds([
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

async function download(dir) {
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
    directoryToSaveFile: dir,
    between: new Between(
      dayjs().subtract(1, "month").startOf('month').format('YYYY-MM-DD'),
      dayjs().subtract(1, "month").endOf('month').format('YYYY-MM-DD')
    ),
  })
  await client.quit()
}

async function execCmds(cmds) {
  const iconv = new Iconv('SHIFT_JIS', 'UTF-8')

  for (let i = 0; i < cmds.length; i++) {
    const cmd = cmds[i];
    console.log(JSON.stringify({data: cmd}));
    const {stdout, stderr} = await exec(cmd, {encoding: 'Shift_JIS'})
    if(stdout) {
      console.log(iconv.convert(stdout).toString())
    }
    if(stderr){
      console.log(iconv.convert(stderr).toString())
    }
  }
}

async function rmPeriodInFilename(dir) {
  const xs = await readdir(dir)
  for (let i = 0; i < xs.length; i++) {
    var old = xs[i],
        n = xs[i].replace(/\.(?=\d+)/g, '_');
    await rename(path.join(dir, old), path.join(dir, n))
      .catch(e => console.log(e));
  }
}

async function rmdirX(dir) {
  const xs = await readdir(dir)
  for (let i = 0; i < xs.length; i++) {
    await unlink(path.join(dir, xs[i]))
      .catch(e => console.log(e));
  }
  await rmdir(dir)
}

module.exports = router;
