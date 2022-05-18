const { FmClient, MovementExport, Between } = require('fmww-library');

class MovementExporter {
  async export(dir, options = {}) {
    const client = new FmClient()
    await client.open(process.env.FMWW_SIGN_IN_URL)
    .signIn({
      FMWW_ACCESS_KEY_ID     : process.env.FMWW_ACCESS_KEY_ID,
      FMWW_USER_NAME         : process.env.FMWW_USER_NAME,
      FMWW_SECRET_ACCESS_KEY : process.env.FMWW_SECRET_ACCESS_KEY,
      FMWW_PASSWORD          : process.env.FMWW_PASSWORD
    })
    .createAbility(MovementExport);
  
    await client.export({
      ...options,
      directoryToSaveFile: dir,
      between: new Between(
        options.beginDate,
        options.endDate
      ),
    })
    await client.quit()
  }
}

module.exports = MovementExporter;