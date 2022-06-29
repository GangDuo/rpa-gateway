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
  ws.on('message', async function(msg) {
    try {
      const me = new MovementExporter;
      const tmpdir = Helpers.tmpdir();
      console.log(tmpdir)

      await mkdir(tmpdir);

      await me.export(tmpdir, {
        beginDate: '2022-06-01',
        endDate: '2022-06-30',
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
