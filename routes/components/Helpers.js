var os = require('os');
var path = require('path');
var fs = require("fs");
var util = require('util');

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
}

module.exports = Helpers;