const logger = require('../../../utils/logger')
const format = require('../../lib/format')

// OpenAI
const OpenAI = require('openai-api');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

let query = async (body) => {
    const fmQuestion = body['fm-question'] //question asked by user
    const fmConversation = body['fm-conversation'] //string passed in previous response 'converationPayload'
    const fmAvatar = JSON.parse(body['fm-avatar']) //contextual information, 'type' is 'WELCOME' or 'QUESTION'
    const fmType = fmAvatar.type

    let conversationPayload = {}
    let question = ''
    let response = {}
    let instructions = {}
    let answer = ''

    let prompt = "The following is a conversation with an AI assistant. " +
            "The assistant is helpful, creative, clever, and very friendly." +
            "\n\nHuman: Hello, who are you?" +
            "\nAI: I am an AI created by OpenAI. How can I help you today?" +
            "\nHuman: "
    let start_sequence = "\nAI:"
    let restart_sequence = "\nHuman: "

    conversationPayload = JSON.parse(fmConversation)
    logger.debug(answer)

    response = getOpenAIResponse(prompt).data.choices[0].text

    logger.info('Got OpenAI response')
    logger.debug(`Raw OpenAI response: ${JSON.stringify(response)}`)

    /* Parse the result and return */
    answer = await format.parseAnswer(response)
    return format.responseJSON(answer, instructions, conversationPayload)

}

let getOpenAIResponse = async (prompt) => {
    const gptResponse = await openai.complete({
        engine: 'davinci',
        prompt: prompt fmQuestion,
        temperature: 0.9,
        maxTokens: 5,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0.6,
        stop: ["\n", " Human:", " AI:"]
    });

    console.log(gptResponse.data);
}

module.exports = {
    query,
}