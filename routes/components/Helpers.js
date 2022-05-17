var os = require('os');
var path = require('path');

class Helpers {
  static tmpdir() {
    return path.join(os.tmpdir(), Math.random().toString(36).substring(2));
  }
}

module.exports = Helpers;