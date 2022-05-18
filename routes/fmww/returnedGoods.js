var fs = require("fs");
var path = require('path');
var util = require('util');
const dayjs = require('dayjs');
var express = require('express');
const { FmClient, PurchasingAsBatch } = require('fmww-library');
var router = express.Router();
const mkdir = util.promisify(fs.mkdir);
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

const MovementExporter = require('../components/MovementExporter');
const Helpers = require('../components/Helpers');

const WORK_DIR = process.env.RPA_APP_HOME
const BIN = process.env.BIN_RETURNED_GOODS

router.get('/', function(req, res, next) {
  res.render('fmww/returnedGoods/index', { title: '仕入返品' });
});

router.ws('/', function(ws, req) {
  ws.on('message', async function(msg) {
    try {
      const me = new MovementExporter;
      const tmpdir = Helpers.tmpdir();
      console.log(tmpdir)

      await mkdir(tmpdir);

      await me.export(tmpdir, {
        beginDate: dayjs().subtract(40, "day").format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
        receivers: ['9000'],
      });

      await Helpers.rmPeriodInFilename(tmpdir);

      const xs = await readdir(tmpdir)
      const filepath = Helpers.tmpFilepath();

      await Helpers.execCmds([
        `pushd "${WORK_DIR}"&${BIN} /cmd "import;${path.join(tmpdir, xs[0])}"`,
        `pushd "${WORK_DIR}"&${BIN} /cmd "export;${filepath}"`,
        `pushd "${WORK_DIR}"&${BIN} /cmd save;`,
      ]);

      const stats = await stat(filepath);
      if(stats.size === 0) {
        ws.send(JSON.stringify({data: '返品データがありません。'}));
      } else {
        const statusText = await upload(filepath);
        if(statusText) {
          ws.send(JSON.stringify({data: statusText}));
        }  
      }
    } catch (error) {   
      console.log(error)   
    } finally {
      ws.send(JSON.stringify({data: ''}));
    }
  });
});

async function upload(filepath) {
  console.log(`upload: ${filepath}`)

  const client = new FmClient()
  await client
    .open(process.env.FMWW_SIGN_IN_URL)
    .signIn({
      FMWW_ACCESS_KEY_ID     : process.env.FMWW_ACCESS_KEY_ID,
      FMWW_USER_NAME         : process.env.FMWW_USER_NAME,
      FMWW_SECRET_ACCESS_KEY : process.env.FMWW_SECRET_ACCESS_KEY,
      FMWW_PASSWORD          : process.env.FMWW_PASSWORD
    })
    .createAbility(PurchasingAsBatch)
  const response = await client.create({
    filePath: filepath
  })
  await client.quit();
  return response.statusText;
}

module.exports = router;
