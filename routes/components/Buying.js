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

  static async halveLastMonth() {
    const tmpl = 'YYYY年MM月DD日'
    var d1 = dayjs().subtract(1, "month").startOf('month');
    return [{
      begin: d1.format(tmpl),
      end: d1.add(14, "day").format(tmpl)
    }, {
      begin: d1.add(15, "day").format(tmpl),
      end: d1.endOf('month').format(tmpl)
    }]
  }
}

module.exports = Buying;