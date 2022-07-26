import FanaClient from './FanaClient.js'

export default class FanaConfig {
  constructor(sdkKey, bearerAddress, userContext) {
    this.sdkKey = sdkKey;
    this.bearerAddress = bearerAddress;
    this.userContext = userContext;
  }

  async connect() {
    const client = new FanaClient(this);
    try {
      await client.getEvals();
      return client;
    } catch (e) {
      console.log('connection failed')
      return client;
    }
  }
}