import React, { useState, useEffect } from 'react';

export const FanaContext = React.createContext();

export const FanaProvider = ({ children, config }) => {
  const [sdkClient, setSdkClient] = useState(undefined);
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    const connect = async() => {
      const client = await config.connect();
      setSdkClient(client);
      setClientReady(true);
    }
    connect();
  }, [])

  useEffect(() => {
    if (!clientReady) return;

    let eventSource = new EventSource(`${config.bearerAddress}/stream/client?sdkKey=${sdkClient.config.sdkKey}`);

    eventSource.onopen = () => {
      console.log('SSE connection established');
    };

    eventSource.onmessage = (e) => {
      console.log('message received', e.data)
    }

    eventSource.addEventListener(config.sdkKey, (e) => {
      console.log('received toggle off', e.data);
      const newClient = Object.assign(
        Object.create(Object.getPrototypeOf(sdkClient)),
        sdkClient
      );

      const streamedData = JSON.parse(e.data);
      
      for (let flag in streamedData) {
        newClient.setEval(flag, streamedData[flag].status)
      }

      setSdkClient(newClient);
    })
  }, [clientReady]);

  if (!clientReady) return null;

  return (
    <FanaContext.Provider value={sdkClient}>
      {children}
    </FanaContext.Provider>
  )
}