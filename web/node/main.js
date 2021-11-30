const uneeqPackage = require('uneeq-js');
const request = require("request");

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

// Sentences to check for pronunciation assessment
const sentence = ["There are seven good days in one good week, and then it is Sunday again.",
    "The winter sun is not.",
    "stomp",
    "Now drop it on the floor, and stomp on it until it pops!",
    "Is that a long snake?",
    "spring",
    "In the spring, when it gets warm, I make a nest.",
    "autumn",
    "When autumn comes and cummer goes, leaves turn brown.",
    "ground",
    "They dig ten holes in the ground.",
    "soft",
    "How many bats and balls do you see?"]
// counter to iterate the sentences
let counter = 0;

const msgDisplay = document.getElementById('msg');
const sevenGoodDays = document.getElementById('seven-good-days');
const theSun = document.getElementById('the-sun');
const funAndBalloons = document.getElementById('fun-and-balloons');
const whatIsThat = document.getElementById('what-is-that');
const bettyBird = document.getElementById('betty-bird');
const januaryToDecember = document.getElementById('january-to-december');
const ten = document.getElementById('ten');
const theBallGame = document.getElementById('the-ball-game');
const phonicsCh = document.getElementById('phonics-ch');
const phonicsCk = document.getElementById('phonics-ck');
const phonicsEr = document.getElementById('phonics-er');
const phonicsOo = document.getElementById('phonics-oo');
const phonicsOu = document.getElementById('phonics-ou');
const phonicsOw = document.getElementById('phonics-ow');

document.getElementById('1').addEventListener('click', ()=> {
    skipComponent(1)
});
document.getElementById('2').addEventListener('click', ()=> {
    skipComponent(3)
});
document.getElementById('3').addEventListener('click', ()=> {
    skipComponent(5)
});
document.getElementById('4').addEventListener('click', ()=> {
    skipComponent(8)
});
document.getElementById('5').addEventListener('click', ()=> {
    skipComponent(10)
});
document.getElementById('6').addEventListener('click', ()=> {
    skipComponent(13)
});
document.getElementById('7').addEventListener('click', ()=> {
    skipComponent(16)
});
document.getElementById('8').addEventListener('click', ()=> {
    skipComponent(19)
});
document.getElementById('9').addEventListener('click', ()=> {
    skipComponent(22)
});
document.getElementById('10').addEventListener('click', ()=> {
    skipComponent(23)
});
document.getElementById('11').addEventListener('click', ()=> {
    skipComponent(24)
});
document.getElementById('12').addEventListener('click', ()=> {
    skipComponent(25)
});
document.getElementById('13').addEventListener('click', ()=> {
    skipComponent(26)
});
document.getElementById('14').addEventListener('click', ()=> {
    skipComponent(27)
});

let uneeqInstance;

document.getElementById('start-btn').addEventListener('click', startDigitalHuman);
document.getElementById('end-btn').addEventListener('click', endSession);

document.getElementById('start').addEventListener('click', (event) => {
    uneeqInstance.sendTranscript('ReadSentence')
});

sevenGoodDays.addEventListener('ended', (event) => {
    afterVideo('SevenGoodDays')
});
theSun.addEventListener('ended', (event) => {
    afterVideo('TheSun')
});
funAndBalloons.addEventListener('ended', (event) => {
    afterVideo('FunAndBalloons')
});
whatIsThat.addEventListener('ended', (event) => {
    afterVideo('WhatIsThat')
});
bettyBird.addEventListener('ended', (event) => {
    afterVideo('BettyBird')
});
januaryToDecember.addEventListener('ended', (event) => {
    afterVideo('JanuarytoDecember')
});
ten.addEventListener('ended', (event) => {
    afterVideo('TEN')
});
theBallGame.addEventListener('ended', (event) => {
    afterVideo('TheBallGame')
});
phonicsCh.addEventListener('ended', (event) => {
    afterVideo('Phonics')
});
phonicsCk.addEventListener('ended', (event) => {
    afterVideo('Phonics')
});
phonicsEr.addEventListener('ended', (event) => {
    afterVideo('Phonics')
});
phonicsOo.addEventListener('ended', (event) => {
    afterVideo('Phonics')
});
phonicsOu.addEventListener('ended', (event) => {
    afterVideo('Phonics')
});
phonicsOw.addEventListener('ended', (event) => {
    afterVideo('GOODBYE')
});

// Add push to talk key listeners
function addPTTKeyListeners() {

    // When the user presses down on the S key, tell the digital human to start recording (start listening)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'KeyS' && !e.repeat && e.target.type !== 'text') {
            // Ask uneeq-js to startRecording the users voice (to speak to the digital human)
            uneeqInstance.startRecording();
        }
    });

    // When the user releases the KeyS bar, tell the digital human to stop recording (stop listening)
    document.addEventListener('keyup', (e) => {
        if (e.code === 'KeyS' && !e.repeat && e.target.type !== 'text') {
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

            // Add key listeners on KeyS for start and stop recording
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
            // Start the lesson after short conversation
            if (msg.answer.includes("Alright. Enough with the chitchat. Let's get started with our lesson today.")) {
                setTimeout(afterQuestion, 7000)
            }
            // Go back to lesson video after asking questions
            if (msg.answer.includes("*")) {
                setTimeout(afterQuestion, 7000)
            }
            // Select the next pronunciation assessment sentence
            if (msg.answer.includes("#")) {
                counter++;
            }
            break;


        default:

            // Additional messages sent by uneeq-js that can be handled.
            console.log('uneeq-js: Unhandled message \'' + msg.uneeqMessageType + '\'', msg);
            break;
    }
}

function skipComponent(n) {
    showPage(n)
    window.scrollTo(0, document.body.scrollHeight)
}

// Scroll to bottom of screen after Q&A
function afterQuestion() {
    plusDivs(1)
    window.scrollTo(0, document.body.scrollHeight)
}

// Scroll back to the top after lesson videos and pronunciation assessment
function afterVideo(component) {
    window.scrollTo(0,0)
    uneeqInstance.sendTranscript(component)
}

// Show next page
function plusDivs(n) {
    showPage(slideIndex += n);
}

// Show specific page
function showPage(n) {
    let slides = document.getElementsByClassName('mySlides')
    if (n > slides.length) {
        slideIndex = 0
    }
    if (n < 0) {
        slideIndex = slides.length
    }
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slides[n].style.display = 'block';
    slideIndex = n;
}

// Start the digital human session
// 1. Update UI state to loading
// 2. Get digital human single use token
// 3. Init uneeqInstance with token
//
// After a few seconds the digital human should be visible and ready for interaction
function startDigitalHuman() {

    // Show the first page
    let slideIndex = 0;
    showPage(slideIndex);

    // Create an instance of Uneeq
    uneeqInstance = new uneeqPackage.Uneeq({
        url: UNEEQ_URL,
        conversationId: UNEEQ_CONVERSATION_ID,
        playWelcome: true,
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
        .then((data) => data.json())
        .then((result) => {

            // Once a single use token has been obtained, initialise the uneeq library with it
            uneeqInstance.initWithToken(result.token);

        })
        .catch((err) => {
            console.error('Could not get a token. Is your token service running?', err);
            msgDisplay.innerHTML = 'Could not get an access token. Please check developer console for details.';
        });

}

// Send audio data for pronunciation assessment for the sentence
function pronunciation(audio, sentence) {
    let openApiURL = 'http://aiopen.etri.re.kr:8000/WiseASR/Pronunciation';

    let accessKey = '0f0fbd71-30ac-43ad-b7a1-f3612ae62b2f';
    let languageCode = 'english';
    let script = `${sentence}`;

    let requestJson = {
        'access_key': accessKey,
        'argument': {
            'language_code': languageCode,
            'script': script,
            'audio': audio.toString('base64')
        }
    };

    let options = {
        url: openApiURL,
        body: JSON.stringify(requestJson),
        headers: {'Content-Type': 'application/json; charset=UTF-8'}
    };
    request.post(options, function (error, response, body) {
        console.log('responseCode = ' + response.statusCode);
        console.log('responseBody = ' + body);
        let res = JSON.parse(body);
        // Sent the result to UneeQ
        uneeqInstance.sendTranscript(res.return_object.score);
    });

}

//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

let gumStream; 						//stream from getUserMedia()
let rec; 							//Recorder.js object
let input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb.
let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext //audio context to help us record

let recordButton = document.getElementById("recordButton");
let stopButton = document.getElementById("stopButton");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);

function startRecording() {
    console.log("recordButton clicked");

    /*
        Simple constraints object, for more advanced audio features see
        https://addpipe.com/blog/audio-constraints-getusermedia/
    */

    let constraints = { audio: true, video:false }

    /*
       Disable the record button until we get a success or fail from getUserMedia()
   */

    recordButton.disabled = true;
    stopButton.disabled = false;

    /*
        We're using the standard promise based getUserMedia()
        https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    */

    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

        /*
            create an audio context after getUserMedia is called
            sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
            the sampleRate defaults to the one set in your OS for your playback device

        */
        audioContext = new AudioContext({
            sampleRate: 16000,
        });

        /*  assign to gumStream for later use  */
        gumStream = stream;

        /* use the stream */
        input = audioContext.createMediaStreamSource(stream);

        /*
            Create the Recorder object and configure to record mono sound (1 channel)
            Recording 2 channels  will double the file size
        */
        rec = new Recorder(input,{numChannels:1})

        //start the recording process
        rec.record();
        console.log("Recording started");

    }).catch(function(err) {
        //enable the record button if getUserMedia() fails
        recordButton.disabled = false;
        stopButton.disabled = true;
    });
}

function stopRecording() {
    console.log("stopButton clicked");

    //disable the stop button, enable the record too allow for new recordings
    stopButton.disabled = true;
    recordButton.disabled = false;

    //tell the recorder to stop the recording
    rec.stop();

    //stop microphone access
    gumStream.getAudioTracks()[0].stop();

    //create the wav blob and pass it on to assessPronunciation
    rec.exportWAV(assessPronunciation);
}

// Convert the audio blob and send to pronunciation assessment API
function assessPronunciation(blob) {

    // First convert the blob to array buffer
    let fileReader = new FileReader();
    fileReader.readAsArrayBuffer(blob);
    fileReader.onload = function(event) {
        let arrayBuffer = fileReader.result;

        // Convert the array buffer to Buffer
        let buffer = Buffer.from(arrayBuffer);

        // Send the buffer for assessment
        pronunciation(buffer, sentence[counter]);
        console.log(sentence[counter]);
    };
}