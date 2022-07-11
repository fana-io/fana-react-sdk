import axios from 'axios';

export default class Client {
  constructor(config) {
    this.config = config;
    this.evals = {};
    /*
      userContext is an object passed in by dev formatted like:
      {
        "userId": xxx,
        "country": xxx
        ... all manually defined fields
      }
    */
    /* evals is an object like:
      {
        "flag-name": true,
        "flag-name2": false
      }
    */
  }

  evaluateFlag(flagKey) {
    // if flagKey doesn't exist, it will be undefined and then double ! to false
    return !!this.evals[flagKey];
  }

  setEval(flagName, newStatus) {
    // sets an individual eval field to a new status
    this.evals[flagName] = newStatus;
  }

  async getEvals() {
    // put sdk key in the object instead
    const postObject = {
      userContext: this.config.userContext,
      sdkKey: this.config.sdkKey
    }
    const { data } = await axios.post(`${this.config.bearerAddress}/connect/clientInit/`, postObject);

    // store the returned flag evaluation data
    // data.flagEvaluations.forEach(flagEval => {
    //   this.setEval(flagEval.name, flagEval.value);
    // });
    this.evals = data;
  }
}