var fs = require("fs");
var util = require('util');
const dayjs = require('dayjs');
var express = require('express');
var router = express.Router();
const mkdir = util.promisify(fs.mkdir);

const MovementExporter = require('../components/MovementExporter');
const Helpers = require('../components/Helpers');

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
    } catch (error) {   
      console.log(error)   
    } finally {
      ws.send(JSON.stringify({data: '終了！'}));
      ws.send(JSON.stringify({data: ''}));
    }
  });
});

module.exports = router;
