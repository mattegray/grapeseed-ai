# uneeq-integration

This is an implementation of a REST API which performs three functions;

1. Digital human conversation (solicited and unsolicited)
2. Single use token requests
3. Diagnostics

### 1. Digital human conversation

This application implements conversation platform integration with a UneeQ digital human (as documented at https://docs.uneeq.io/#/chatbot_integration?id=conversation-platform-integration-overview). The application can be configured to connect a UneeQ digital human to Dialogflow, Dialogflow CX, Watson, Lex, Wolfram Alpha, and Directline concurrently. The application creates six POST routes, with the paths configurable in the environment variables (see below) - if configured, this allows a single instance of this integration application to connect to any of the six platforms, by configuring the digital human to make requests to the associated route (using the 'Other Conversation Platform' options in UneeQ Creator).

The application also implements the unsolicited response or 'speak' API (as documented at https://docs.uneeq.io/#/unsolicited_responses?id=unsolicited-responses-overview), which allows responses to be pushed to a digital human during a conversation without first being triggered by an end user input. This allows for both synchronous and asynchronous interactions between the end user and the digital human.

### 2. Single use token requests

The application also implements the token request API (as documented at https://docs.uneeq.io/#/access_token?id=obtaining-an-access-token). This allows a web frontend implementing the UneeQ SDK to request a single use token which can be used to start a conversation.

### 3. Diagnostics

There are also two diagnostic routes. The "/parrot" route will return a response payload which echoes the user input, which allows the interface to be tested without requiring a round trip to an NLP service. The "/ping" route returns a heartbeat response which allows the application to work with load balancers and monitoring applications.

<p>&nbsp;</p>

**This code is made available as is, for use by customers and partners to quickly implement their own integration of a digital human with NLP services or the speak API. However this is sample code ONLY and is not intended for production deployment, and no support or warranty is given expressly or implied in any form. All material is subject to the license included in this repository.**

<p>&nbsp;</p>
<p>&nbsp;</p>

---

# Prerequisites

You must have a UneeQ Creator account (https://creator.uneeq.io/register) with a configured digital human persona.

<p>&nbsp;</p>
<p>&nbsp;</p>

---

# Environment

Several environment variables are required - where you place these will depend on your deployment (e.g. these can be placed in a local .env file or as variables in your application platform). This repo contains an empty .env.default file for convenience.

Only the variables for the service being configured are required - others can be ignored. Any service not explicitly set to true will be ignored, and the route will also not be bound (so that 404 not found responses are triggered).

For clarity, the environment variables are grouped by purpose below - NLP Services, UneeQ API Services, SSML Parameters (which allow you to add markup to plain text), and Common.

---

## NLP Services

#### Common (required)

```
API_ROUTE_NLP_STEM (the stem for all the NLP routes - defaults to "/nlp")
AUTHORIZATION_REQUIRED (true/false - whether to require an 'Authorization' header passing the shared secret configured below)
AUTHORIZATION_HEADER (shared secret - UneeQ supports the sending of custom headers for basic authorization - only required if AUTHORIZATION_REQUIRED is true)
```

#### If using Dialogflow (optional)

```
API_ROUTE_NLP_DIALOGFLOW (path for your Dialogflow API, defaults to "/dialogflow")
DIALOGFLOW_ENABLED (true/false - will prevent the route from trying to call the API if you're not using this platform)
DIALOGFLOW_CONFIG_PROJECTID (your Dialogflow project ID)
DIALOGFLOW_CONFIG_PROJECTLANGUAGE (Dialogflow project language code, e.g en-US)
DIALOGFLOW_CONFIG_USEKNOWLEDGEBASE (true/false whether to query a knowledge base in your agent)
DIALOGFLOW_CONFIG_PROJECTKNOWLEDGEBASE (Knowledge base name in path form - e.g. projects/<<projectID>>/knowledgeBases/<<knowledgeBaseId>>)
DIALOGFLOW_CONFIG_CREDENTIALS (stringified credential JSON to connect to your agent)
```

#### If using Dialogflow CX (optional)

```
API_ROUTE_NLP_DIALOGFLOWCX (path for your Dialogflow CX API, defaults to "/dialogflowcx")
DIALOGFLOWCX_ENABLED (true/false - will prevent the route from trying to call the API if you're not using this platform)
DIALOGFLOWCX_CONFIG_PROJECTID (your Dialogflow CX project ID)
DIALOGFLOWCX_CONFIG_PROJECTLANGUAGE (Dialogflow CX project language code, e.g en-US)
DIALOGFLOWCX_CONFIG_AGENT (Dialogflow CX allows multiple agents per project, so requires the agent ID)
DIALOGFLOWCX_CONFIG_LOCATION (Dialogflow CX project location, usually 'global')
DIALOGFLOWCX_CONFIG_CREDENTIALS (stringified credential JSON to connect to your agent)
DIALOGFLOWCX_CONFIG_ENVIRONMENT (Dialogflow CX environment as defined in CX, e.g. Draft, Production)
```

#### If using Lex (optional)

```
API_ROUTE_NLP_LEX (path for your Lex API, defaults to "/lex")
LEX_ENABLED (as above)
LEX_CONFIG_AWSREGION (the region in which your bot is configured, e.g. us-east-1)
LEX_CONFIG_ACCESSKEYID (the access key for an IAM account)
LEX_CONFIG_SECRETACCESSKEY (the secret access key for the above account)
LEX_CONFIG_BOTALIAS=$LATEST (defaults to $LATEST)
LEX_CONFIG_BOTNAME (the name of your bot)
LEX_CONFIG_WELCOMEINTENT (the name of the intent you want to trigger as the welcome message)
```

#### If using Watson (optional)

```
API_ROUTE_NLP_WATSON (path for your Watson API, defaults to "/watson")
WATSON_ENABLED (as above)
WATSON_CONFIG_IAMAPIKEY (API key for your Watson resource)
WATSON_CONFIG_ASSISTANTID (the ID for your Assistant - not the individual skill)
WATSON_CONFIG_ENDPOINTURI (the endpoint address for your Watson resource)
```

#### If using Wolfram Alpha (optional)

```
API_ROUTE_NLP_WOLFRAM (path for your Wolfram Alpha API, defaults to "/wolfram")
WOLFRAM_ENABLED (as above)
WOLFRAM_CONFIG_APPID (an AppID issued by Wolfram to access the conversation API)
WOLFRAM_CONFIG_APIBASEURL="http://api.wolframalpha.com" (the current default)
WOLFRAM_CONFIG_APIROUTE="/v1/conversation.jsp?appid=" (the current default)
WOLFRAM_CONFIG_QUERYPARAM=i (the current default)
WOLFRAM_CONFIG_SESSIONPARAM=conversationid (the current default)
WOLFRAM_CONFIG_GREETING="Hi there. Ask me a question and I'll see what Wolfram Alpha has to say." (a friendly greeting - Wolfram is not built for chit-chat!)
WOLFRAM_CONFIG_NOTFOUNDMSG="Sorry. It looks like Wolfram Alpha doesn't have an answer for that question. Try another one!" (as above)
```

#### If using Directline (optional)

```
API_ROUTE_NLP_DIRECTLINE (path for your Directline API, defaults to "/directline")
DIRECTLINE_ENABLED (as above)
DIRECTLINE_CONFIG_SECRET (from your bot exposed through the Directline channel, the API secret)
DIRECTLINE_CONFIG_SCENARIO (required for Health Bot implementations - the scenario to be triggered on welcome)
DIRECTLINE_CONFIG_LOCALE (the language locale)
```

---

## UneeQ API Services

#### If using the token route (optional)

```
API_ROUTE_TOKEN (path for your token request API, defaults to "/token")
TOKEN_ROUTE_ENABLED (true/false - will prevent the route from trying to call the API if you're not using the token service)
TOKEN_UNEEQ_URL (the URL for the UneeQ API as shown in your Developer dashboard in Creator - e.g. https://api.us.uneeq.io)
TOKEN_UNEEQ_ROUTE=/api/v1/clients/access/tokens (the route in the token request documentation)
TOKEN_UNEEQ_JWTSECRET (your JWT secret as shown in your Developer dashboard in Creator)
TOKEN_UNEEQ_PERSONAID (the persona ID to start the conversation with, as shown in the Personas dashboard in Creator)
```

#### If using the unsolicited response/'speak' route (optional)

```
API_ROUTE_SPEAK (path for your token request API, defaults to "/speak")
SPEAK_ROUTE_ENABLED (true/false - will prevent the route from trying to call the API if you're not using the speak service)
SPEAK_UNEEQ_URL (the URL for the UneeQ API as shown in your Developer dashboard in Creator - e.g. https://api.us.uneeq.io)
SPEAK_UNEEQ_ROUTE=/api/v1/avatar/ (the route in the speak request documentation)
SPEAK_UNEEQ_JWTSECRET (your JWT secret as shown in your Developer dashboard in Creator - for security this is used for signature verification on calls to your API, and to then encode the request before sending to UneeQ)
```

---

## SSML Parameters

```
SSML_ENFORCED (if true, SSML is added to plain text responses before the response JSON is generated)
SSML_AUTO_BREAKS (if SSML is enforced and this variable is true, punctuation marks defined in the array below are augmented with SSML break tags )
SSML_AUTO_BREAKS_VALUES (an array of objects with mark, attribute, and strength properties - the 'mark' values define which punctuation marks are augmented, the 'attribute' value defines what type of break tag is written (applies the SSML standard, so strength or time) along with the 'value e.g. [{ "mark": ",", "attribute": "strength", "value": "weak" }, { "mark": ".", "attribute": "strength", "value": "strong" }] )
SSML_AMAZON_NEURAL (if true, this adds the speak tags that comply with the Amazon Polly neural style)
SSML_AMAZON_NEURAL_STYLE (if the NEURAL property is true, defines either the "conversational" or "news" style)
```

---

## Common

```
LOG_LEVEL (output log level - accepts error, warn, info, verbose, debug)
API_ROUTE (the stem for your API routes, defaults to "/api/v1")
```

---

## Other

```
API_ROUTE_PARROT (path for your parrot API, defaults to "/parrot")
PARROT_ROUTE_ENABLED (same effect as all other routes)
```

UneeQ's platform requires that third-party integration apps must be deployed with an SSL endpoint. The URL for your app will be required when configuring the digital human persona to use your conversation interface - e.g. https://<<yourapp>>/api/(dialogflow/lex/watson). Note that if you choose to require an authorization header for your app (as above) this must be configured by UneeQ.

<p>&nbsp;</p>
<p>&nbsp;</p>

---

# Containerising

The repo includes a simple Dockerfile which will produce a docker image:

```
docker build -t uneeq-integration .
```

The environment variables can be passed at runtime by creating a file at the root level called env.list (use .env.default as the template) and running the docker image with the --env-file option:

```
docker run [...] --env-file ./env.list -d uneeq-integration
```

<p>&nbsp;</p>
<p>&nbsp;</p>

---

# Testing

A full end-to-end test of all enabled platforms (\_ENABLED=true) can be run with npm test.

The app can also be tested using Postman (or equivalent) with the sample JSON payloads at docs.uneeq.io. The first request in a conversation will have a 'type' value of 'WELCOME', which will trigger your welcome intent (note that for Lex you must configure a specific Welcome intent - see the variables above):

```
{
"sid": "set during token request",
"fm-custom-data": "{\"custom-data\":\"set during token request\"}",
"fm-question": "",
"fm-avatar": "{\"type\":\"WELCOME\",\"avatarSessionId\":\"123456789\"}",
"fm-conversation": null
}
```

Subsequent inputs from the end user will produce request payloads with a 'type' value of 'QUESTION', which will trigger any matched intent in your Dialogflow agent.

```
{
"sid": "set during token request",
"fm-custom-data": "{\"custom-data\":\"set during token request\"}",
"fm-question": "I want to make a booking",
"fm-avatar": "{\"type\":\"QUESTION\",\"avatarSessionId\":\"123456789\"}",
"fm-conversation": "{\"platformSessionId\":\"<<RETURNED BY YOUR CONVERSATION PLATFORM>>\"}"
}
```

<p>&nbsp;</p>
<p>&nbsp;</p>

---

# Configuring

## NLP Services and the Parrot Service APIs

Once the application is deployed, configured and tested (see below), use the persona configuration dashboard in Creator to choose 'Other Conversation Platform' as the platform for the persona, and enter the fully qualified URL for your interface (e.g. https://<<your-host>>/api/v1/nlp/dialogflow - would be the path for the Dialogflow service if using the default paths, and https://<<your-host>>/api/v1/parrot as the path for parrot). Starting a conversation with the persona through Creator will then either begin a conversation with the corresponding NLP service, or repeat your input if using parrot.

## Unsolicited Responses ('Speak') API

Once a conversation has been established with a persona, passing this payload to the speak route (e.g. https://<<your-host>>/api/v1/speak if using the defaults) will cause the digital human to speak the dialog in the answer field;

```
{
"answer": "I'm giving an unsolicited response",
"answerAvatar": "{}",
"sessionId": "AVATAR_SESSION_ID"
}
```

This API allows for asynchronous responses from the digital human, which means if you have long-running transactions that are being triggered by conversation you can send an immediate response/acknowledgement, and then 'push' a completion message when the transaction has finished. You need the avatarSessionId (passed in the fm-avatar field with each request) and pass it in the sessionId field.

## Token Requests

Sending a GET request to the token route will return a single use token, which can then be passed as the tokenId parameter to the initWithToken method to begin a new conversation.

<p>&nbsp;</p>
<p>&nbsp;</p>

---

# License

This project is licensed under the ISC License - see the [LICENSE.md](LICENSE.md) file for details.
