var fs = require("fs");
var path = require('path');
var util = require('util');
const dayjs = require('dayjs');
var express = require('express');
var router = express.Router();
const mkdir = util.promisify(fs.mkdir);
const readdir = util.promisify(fs.readdir);

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
    } catch (error) {   
      console.log(error)   
    } finally {
      ws.send(JSON.stringify({data: '終了！'}));
      ws.send(JSON.stringify({data: ''}));
    }
  });
});

module.exports = router;
