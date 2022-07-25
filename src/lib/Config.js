import Client from './Client.js'

export default class Config {
  constructor(sdkKey, bearerAddress, userContext) {
    // initialize with sdkKey, bearer address, and userContext
    this.sdkKey = sdkKey;
    this.bearerAddress = bearerAddress;
    this.userContext = userContext;
  }

  async connect() {
    const client = new Client(this);
    try {
      // get eval object
      await client.getEvals();
      return client;
    } catch (e) {
      console.log('connection failed')
      return client;
    }
  }

  // reset context?
  // how are we able to reset the sdkClient within the provider?
  // is it okay if the user is just expected to refresh the page? probably not...?
  // what if the dev just refreshes the page for them??????? idk if that's a good thing
}