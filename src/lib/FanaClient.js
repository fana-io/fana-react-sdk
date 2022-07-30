import axios from 'axios';

export default class FanaClient {
  constructor(config) {
    this.config = config;
    this.evals = {};
  }

  evaluateFlag(flagKey, defaultValue = false) {
    if (!this.evals.hasOwnProperty(flagKey)) {
      return defaultValue;
    }

    return this.evals[flagKey];
  }

  setEval(flagName, newStatus) {
    this.evals[flagName] = newStatus;
  }

  async getEvals() {

    const options = {
      headers: {
        Authorization: this.config.sdkKey
      }
    }

    const { data } = await axios.post(`${this.config.bearerAddress}/connect/clientInit/`, this.config.userContext, options);

    this.evals = data;
  }
}