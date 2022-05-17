var os = require('os');
var path = require('path');
var fs = require("fs");
var util = require('util');
var Iconv = require('iconv').Iconv;
var childProcess = require('child_process');

const exec = util.promisify(childProcess.exec);
const readdir = util.promisify(fs.readdir);
const rename = util.promisify(fs.rename);

class Helpers {
  static tmpdir() {
    return path.join(os.tmpdir(), Math.random().toString(36).substring(2));
  }

  static async rmPeriodInFilename(dir) {
    const xs = await readdir(dir)
    for (let i = 0; i < xs.length; i++) {
      var old = xs[i],
          n = xs[i].replace(/\.(?=\d+)/g, '_');
      await rename(path.join(dir, old), path.join(dir, n))
        .catch(e => console.log(e));
    }
  }

  static　async execCmds(cmds) {
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
}

module.exports = Helpers;