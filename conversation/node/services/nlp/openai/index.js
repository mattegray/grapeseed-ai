const logger = require('../../../utils/logger')
const format = require('../../lib/format')

// OpenAI
const OpenAI = require('openai-api');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

let query = async (body) => {

}

let parseResponse = async (response) => {

}

(async () => {
    const gptResponse = await openai.complete({
        engine: 'davinci',
        prompt: 'this is a test',
        maxTokens: 5,
        temperature: 0.9,
        topP: 1,
        presencePenalty: 0,
        frequencyPenalty: 0,
        bestOf: 1,
        n: 1,
        stream: false,
        stop: ['\n', "testing"]
    });

    console.log(gptResponse.data);
})();

module.exports = {
    query,
}