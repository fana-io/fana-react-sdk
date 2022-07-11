import React, { useState, useEffect } from 'react';

export const Context = React.createContext();

export const Provider = ({ children, config }) => {
  const [sdkClient, setSdkClient] = useState(undefined);
  const [clientReady, setClientReady] = useState(false);

  // initialize client and provider states
  useEffect(() => {
    const connect = async() => {
      // this sets off a series of steps that results in the Client populating its evals property
      const client = await config.connect();
      setSdkClient(client);
      setClientReady(true);
    }
    connect();
  }, [])

  // set up SSE connection with sovereign
  useEffect(() => {
    if (!clientReady) return;

    let eventSource = new EventSource(`${config.sovAddress}/clientStream/${config.sdkKey}`);
    eventSource.onmessage = (e) => {
      // make deep copy of sdk client?
      const newClient = Object.assign(
        Object.create(Object.getPrototypeOf(sdkClient)),
        sdkClient
      );

      // stream is passing flag that has been toggled off
      const streamedData = JSON.parse(e.data);

      // it also passes along a type field that should be equal to the sdk - ignore all else
      if (streamedData.type === config.sdkKey) {
        const newFlag = streamedData.message;
        // set the eval accordingly for the toggled off value
        newClient.setEval(newFlag.name, newFlag.status);

        // update the sdkClient, triggering a state update
        setSdkClient(newClient);
      }
    }
  }, [clientReady]);

  // if client is not ready, don't render anything
  if (!clientReady) return null;

  // by passing through sdkClient value, all children have access to the client object (and thus, evaluateFlag)
  return (
    <Context.Provider value={{ sdkClient }}>
      {children}
    </Context.Provider>
  )
}