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

  evaluateFlag(flagKey, defaultValue = false) {
    // if the flag doesn't exist within evals, this means that the flag simply doesn't exist
    // in these cases, the dev can supply a default boolean that will be the evaluation in these cases
    if (!this.evals.hasOwnProperty(flagKey)) {
      return defaultValue;
    }
    // note that this works a bit differently from the server sdk
    // client sdk doesn't store information about whether it's active,
    // only true/false evaluations for a particular flag
    // if a flag is inactive, it means that user will receive a false eval
    // so defaultValue does not work the same way in client sdk vs server sdk

    // all existing flag evals should be received and assigned to the evals property.
    // in those cases, we simply return the value stored there
    return this.evals[flagKey];
  }

  setEval(flagName, newStatus) {
    // sets an individual eval field to a new status
    this.evals[flagName] = newStatus;
  }

  async getEvals() {

    const options = {
      headers: {
        Authorization: this.config.sdkKey
      }
    }

    const { data } = await axios.post(`${this.config.bearerAddress}/connect/clientInit/`, this.config.userContext, options);

    // store the returned flag evaluation data
    // data.flagEvaluations.forEach(flagEval => {
    //   this.setEval(flagEval.name, flagEval.value);
    // });
    this.evals = data;
  }
}