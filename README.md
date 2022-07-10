The React SDK is to be used within the developer's application code. There are 3 primary pieces to it:

1. Client
2. Config
3. Provider Component

## Client
The Client is responsible for:
- Initializing connection with Sovereign
- Fetching and storing evaluation data
- Returning boolean when a flag needs to be evaluated (evaluateFlag())

## Config
Config is responsible for:
- Storing configuration details (SDK key, Sovereign address, user context object)
- Instantiating the Client object
- Invoking the initial connection on the Client

## Provider Component
Provider is responsible for:
- Holding and passing along the Client as part of its state
- Creating the React Context (this provides the Client object to all children so they have access to eval method)
- Starting the connection via the Config
- Determining whether the Client is ready (considering moving this logic to the Client instead)
- Setting up the SSE connection with Sovereign

## How it works
- Developer starts by creating the Config object and passes in the SDK key, Sovereign Address, and User Object
- They wrap their main App component in the <Provider> component, passing in the newly created Config object
- The Provider component will call Config.connect(). This cascades into a series of steps:
  - Client object is created
  - Client object makes POST request to Sovereign, passing along SDK key and User Object
  - Sovereign processes User Object and returns an evaluation object
  - Client object processes evaluation data and stores it
- Provider also sets up SSE to listen for messages from Sovereign's streaming endpoint
- Developer can now access the SDK Client and its methods via the useContext() hook

## When an event is pushed
All of the following occurs within the <Provider> component's SSE listener.
- Creates a deep copy of the existing SDK Client (since we shouldn't mutate state objects)
- Parses the pushed data
- Checks to make sure the "type" is the current SDK key. If not, ignores this message
  - If SDK key matches, set the flag to the new value
- Sets new client object in the state, triggering a render to reflect the update