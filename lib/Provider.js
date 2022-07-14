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

  // set up SSE connection with bearer
  useEffect(() => {
    // what happens if a connection gets dropped? 
    if (!clientReady) return;

    let eventSource = new EventSource(`${config.bearerAddress}/subscribe/client`);
    eventSource.addEventListener(config.sdkKey, (e) => {
      eventSource.onopen = () => {
        console.log('SSE connection established');
      };
      
      // make deep copy of sdk client - necessary bc we can't mutate state so we have to set it again
      const newClient = Object.assign(
        Object.create(Object.getPrototypeOf(sdkClient)),
        sdkClient
      );

      // stream is passing flag that has been toggled off
      const streamedData = JSON.parse(e.data);

      // if (streamedData.type === config.sdkKey) {
      //   const newFlags = streamedData.message;
      //   console.log("NEW FLAGS", newFlags)
      // process new flags in array
      const newFlags = streamedData.flags;
      newFlags.forEach(flag => {
        newClient.setEval(flag.flagKey, flag.value)
      })

      // update the sdkClient, triggering a state update
      setSdkClient(newClient);
    })
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