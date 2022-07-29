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

    const addEventSourceListeners = (es) => {
      es.onopen = () => {
        console.log('SSE connection established');
      };

      es.onmessage = (e) => {
        console.log('message received', e.data)
      }

      es.onclose = () => {
        console.log('event source closed');
        let eventSource = new EventSource(`${config.bearerAddress}/stream/client?sdkKey=${config.sdkKey}`);
        addEventSourceListeners(eventSource);
      }

      es.addEventListener(config.sdkKey, (e) => {
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
    }

    let eventSource = new EventSource(`${config.bearerAddress}/stream/client?sdkKey=${config.sdkKey}`);
    addEventSourceListeners(eventSource);
  }, [clientReady]);

  if (!clientReady) return null;

  return (
    <FanaContext.Provider value={sdkClient}>
      {children}
    </FanaContext.Provider>
  )
}