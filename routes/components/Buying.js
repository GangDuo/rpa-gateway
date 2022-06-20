const dayjs = require('dayjs');
const { FmClient, PurchaseHistory } = require('fmww-library');

class Buying {
  async export(options = {}) {
    const client = new FmClient();
    await client
      .open(process.env.FMWW_SIGN_IN_URL)
      .signIn({
        FMWW_ACCESS_KEY_ID: process.env.FMWW_ACCESS_KEY_ID,
        FMWW_USER_NAME: process.env.FMWW_USER_NAME,
        FMWW_SECRET_ACCESS_KEY: process.env.FMWW_SECRET_ACCESS_KEY,
        FMWW_PASSWORD: process.env.FMWW_PASSWORD
      })
      .createAbility(PurchaseHistory);
    const response = await client.search(options);
    await client.quit();
    return response;
  }

  static halveLastMonth() {
    var d1 = dayjs().subtract(1, "month").startOf('month');
    return Buying.halve(d1, d1.endOf('month'));
  }

  static halve(begin, end) {
    const tmpl = 'YYYY年MM月DD日'

    if(end.get('date') < 15) {
      return [{
        begin: begin.format(tmpl),
        end: end.format(tmpl)
      }]
    } else {
      return [{
        begin: begin.format(tmpl),
        end: begin.add(14, "day").format(tmpl)
      }, {
        begin: begin.add(15, "day").format(tmpl),
        end: end.format(tmpl)
      }]
    }
  }
}

module.exports = Buying;