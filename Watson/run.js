
/******************************************************************************
 * Watson Service
 ******************************************************************************/

// const watson = require('watson-developer-cloud/speech-to-text/v1');
const SpeechToText = require('watson-developer-cloud/speech-to-text/v1');
const ToneAnalyzer = require('watson-developer-cloud/tone-analyzer/v3');
const Conversation = require('watson-developer-cloud/conversation/v1');
const TextToSpeech = require('watson-developer-cloud/text-to-speech/v1');
const config = require('./config.js');
const fs = require('fs');
const mic = require('mic');
const player = require('play-sound')(opts = {});
const probe = require('node-ffprobe');

const attentionWord = config.attentionWord;

/******************************************************************************
 * Create Watson Services
 *******************************************************************************/
const speechToText = new SpeechToText({
    username: config.STTUsername,
    password: config.STTPassword,
    version: 'v1'
});

const toneAnalyzer = new ToneAnalyzer({
    username: config.ToneUsername,
    password: config.TonePassword,
    version: 'v3',
    version_date: '2016-05-19'
});

const conversation = new Conversation({
    username: config.ConUsername,
    password: config.ConPassword,
    version: 'v1',
    version_date: '2016-07-11'
});

const textToSpeech = new TextToSpeech({
    username: config.TTSUsername,
    password: config.TTSPassword,
    version: 'v1'
});

/******************************************************************************
 * Configuring the Microphone
 *******************************************************************************/
const micParams = {
    rate: 44100,
    channels: 2,
    debug: false,
    exitOnSilence: 6,
    device: pulse
};

const micInstance = mic(micParams);
const micInputStream = micInstance.getAudioStream();

let pauseDuration = 0;
micInputStream.on('pauseComplete', ()=> {
    console.log('Microphone paused for', pauseDuration, 'seconds.');
    setTimeout(function() {
        micInstance.resume();
        console.log('Microphone resumed.')
    }, Math.round(pauseDuration * 1000)); //Stop listening when speaker is talking
});

micInstance.start();
console.log('TJ is listening, you may speak now.');

/******************************************************************************
 * Speech To Text
 *******************************************************************************/
const textStream = micInputStream.pipe(
    speechToText.createRecognizeStream({
        content_type: 'audio/l16; rate=44100; channels=2',
    })).setEncoding('utf8');

/******************************************************************************
 * Get Emotional Tone
 *******************************************************************************/
const getEmotion = (text) => {
    return new Promise((resolve) => {
        let maxScore = 0;
        let emotion = null;
        toneAnalyzer.tone({text: text}, (err, tone) => {
            let tones = tone.document_tone.tone_categories[0].tones;
            for (let i=0; i<tones.length; i++) {
                if (tones[i].score > maxScore) {
                    maxScore = tones[i].score;
                    emotion = tones[i].tone_id;
                }
            }
            resolve({emotion, maxScore});
        })
    })
};

/******************************************************************************
 * Text To Speech
 *******************************************************************************/
const speakResponse = (text) => {
    const params = {
        text: text,
        voice: config.voice,
        accept: 'audio/wav'
    };
    textToSpeech.synthesize(params)
        .pipe(fs.createWriteStream('output.wav'))
        .on('close', () => {
            probe('output.wav', function(err, probeData) {
                pauseDuration = probeData.format.duration + 0.2;
                micInstance.pause();
                player.play('output.wav');
            });
        });
};

/******************************************************************************
 * Conversation
 ******************************************************************************/
let start_dialog = false;
let context = {};
let watson_response = '';

speakResponse('Hi there, I am awake.');
textStream.on('data', (user_speech_text) => {
    user_speech_text = user_speech_text.toLowerCase();
    console.log('Watson hears: ', user_speech_text);
    if (user_speech_text.indexOf(attentionWord.toLowerCase()) >= 0) {
        start_dialog = true;
    }

    if (start_dialog) {
        getEmotion(user_speech_text).then((detectedEmotion) => {
            context.emotion = detectedEmotion.emotion;
            conversation.message({
                workspace_id: config.ConWorkspace,
                input: {'text': user_speech_text},
                context: context
            }, (err, response) => {
                context = response.context;
                watson_response =  response.output.text[0];
                speakResponse(watson_response);
                console.log('Watson says:', watson_response);
                if(context.system.dialog_turn_counter == 2) {
                    context = {};
                    start_dialog = false;
                }
            });
        });
    } else {
        console.log('Waiting to hear the word "', attentionWord, '"');
    }
});