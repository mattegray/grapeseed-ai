const uneeqPackage = require('uneeq-js');

/*
URL to get single use token.
The single use token is generated securely using the customers secret. Customer secret should be private to the
token service. Requests from this frontend application to token service should be secured with CORS.
GET_TOKEN_URL = The customer built token service (generates a new single use token). Sample app found in /token/node
* Note: In production, requests should be loaded over https with CORS enabled.
*/
const GET_TOKEN_URL = 'http://localhost:3000/token'; // get token URL from node example in this repo (/token/node)

/*
The UneeQ server to connect to.
This value should be the same as the one used when generating a token (above).
 */
const UNEEQ_URL = 'https://api.us.uneeq.io';

/*
The UneeQ conversation identifier.
This value should be the same as the one used when generating a token (above).
 */
const UNEEQ_CONVERSATION_ID = '15ab68c3-e735-456b-965b-839d474a3524';

const msgDisplay = document.getElementById('msg');

let uneeqInstance;

document.getElementById('start-btn').addEventListener( 'click', startDigitalHuman);
document.getElementById('end-btn').addEventListener( 'click', endSession);

// Add push to talk key listeners
function addPTTKeyListeners() {

    // When the user presses down on space bar, tell the digital human to start recording (start listening)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.repeat && e.target.type !== 'text') {
            // Ask uneeq-js to startRecording the users voice (to speak to the digital human)
            uneeqInstance.startRecording();
        }
    });

    // When the user releases the space bar, tell the digital human to stop recording (stop listening)
    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space' && !e.repeat && e.target.type !== 'text') {
            // Ask uneeq-js to stopRecording the users voice (to stop speaking to the digital human)
            uneeqInstance.stopRecording();
        }
    });
}

/*
Ending a session will immediately stop billing time. The session will continue to run for up to 25 seconds when
refreshing or closing the browser tab without calling endSession and will be included in billing time.
 */
function endSession() {
    uneeqInstance.endSession();
    document.body.classList.remove('live');
}

// Message Handlers for uneeq-js
function messageHandler(msg) {

    switch (msg.uneeqMessageType) {

        // SessionLive: Everything has loaded and the digital human is ready for interaction
        case 'SessionLive':

            // Add key listeners on spacebar for start and stop recording
            addPTTKeyListeners();

            // Clear the onscreen prompts
            msgDisplay.innerHTML = '';

            // Transition the UI from loading state to live state
            document.body.classList.remove('loading');
            document.body.classList.add('live');
            break;


        // The digital human has received a question (utterance) from the user
        case 'AvatarQuestionText':

            // Display the question spoken by the user on screen
            document.getElementById('local-transcript').innerHTML = 'User: ' + msg.question;
            break;


        // The digital human has an answer to the question
        case 'AvatarAnswer':

            // Add the new element onto the screen
            document.getElementById('transcript').innerHTML = 'Digital Human: ' + msg.answerSpeech;
            break;


        default:

            // Additional messages sent by uneeq-js that can be handled.
            console.log('uneeq-js: Unhandled message \'' + msg.uneeqMessageType + '\'', msg);
            break;
    }
}

// Start the digital human session
// 1. Update UI state to loading
// 2. Get digital human single use token
// 3. Init uneeqInstance with token
//
// After a few seconds the digital human should be visible and ready for interaction
function startDigitalHuman() {

    // Create an instance of Uneeq
    uneeqInstance = new uneeqPackage.Uneeq({
        url: UNEEQ_URL,
        conversationId: UNEEQ_CONVERSATION_ID,
        avatarVideoContainerElement: document.getElementById('digital-human-video-container'),
        localVideoContainerElement: document.getElementById('local-video-container'),
        messageHandler: (msg) => messageHandler(msg),
        sendLocalVideo: false
    });

    // Once the user clicks to start a session, display loading message
    msgDisplay.innerHTML = 'Loading...';
    document.body.classList.add('loading');

    // Get single use token from customers integration app
    fetch(GET_TOKEN_URL)
        .then( (data) => data.json() )
        .then( (result) => {

            // Once a single use token has been obtained, initialise the uneeq library with it
            uneeqInstance.initWithToken(result.token);

        })
        .catch( (err) => {
            console.error('Could not get a token. Is your token service running?', err);
            msgDisplay.innerHTML = 'Could not get an access token. Please check developer console for details.';
        });

}
