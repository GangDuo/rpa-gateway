var fs = require("fs");
var util = require('util');
var express = require('express');
var router = express.Router();
const mkdir = util.promisify(fs.mkdir);

const MovementExporter = require('../components/MovementExporter');
const Helpers = require('../components/Helpers');

router.get('/', function(req, res, next) {
  res.render('fmww/waste/index', { title: '廃棄金額' });
});

router.ws('/', function(ws, req) {
  ws.on('message', async function(_msg) {
    try {
      const msg = JSON.parse(_msg)
      const beginDate = msg.data.formData.beginDate;
      const endDate = msg.data.formData.endDate;
      const me = new MovementExporter;
      const tmpdir = Helpers.tmpdir();

      if(!beginDate || !endDate) {
        ws.send(JSON.stringify({data: '日付指定がありません！'}));
        return;
      }

      if(beginDate > endDate) {
        ws.send(JSON.stringify({data: '期間があいまいです！'}));
        return;
      }

      console.log(tmpdir)

      await mkdir(tmpdir);

      await me.export(tmpdir, {
        beginDate,
        endDate,
        receivers: ['8000'],
      });
    } catch (error) {   
      console.log(error)   
    } finally {
      ws.send(JSON.stringify({data: ''}));
    }
  });
});

module.exports = router;