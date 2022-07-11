import Client from 'beta-react-sdk/lib/Client.js'

export default class Config {
  constructor(sdkKey, sovAddress, userContext) {
    // initialize with sdkKey, sovereign address, and userContext
    this.sdkKey = sdkKey;
    this.sovAddress = sovAddress;
    this.userContext = userContext;
  }

  async connect() {
    try {
      const client = new Client(this);
      // get eval object
      await client.getEvals();
      return client;
    } catch (e) {
      console.log('connection failed')
    }
  }
}