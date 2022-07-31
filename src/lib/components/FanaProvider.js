import React, { useState, useEffect } from 'react';

export const FanaContext = React.createContext();

export const FanaProvider = ({ children, config }) => {
  const [sdkClient, setSdkClient] = useState(undefined);
  const [clientReady, setClientReady] = useState(false);

  const attemptLimit = 3;

  useEffect(() => {
    const initialize = async() => {
      const client = await config.connect();
      setSdkClient(client);
      setClientReady(true);
    }
    initialize();
  }, [])

  useEffect(() => {
    if (!clientReady) return;

    let attempts = 0;

    const addEventSourceListeners = (es) => {
      es.onopen = () => {
        console.log('SSE connection established');
      };

      es.onerror = () => {
        if (attempts === attemptLimit) {
          es.close();
        } else {
          attempts++;
        }
      }

      es.onmessage = (e) => {
        console.log('message received', e.data)
      }

      es.addEventListener(config.sdkKey, (e) => {
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