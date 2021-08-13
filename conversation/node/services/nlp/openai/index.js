const logger = require('../../../utils/logger')
const format = require('../../lib/format')

// OpenAI
const OpenAI = require('openai-api');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

let sessionChatLog
let userPrompt
let initialPrompt = "My name is Cindy. I am a teacher at a kindergarten. " +
    "I am 26 years old and I like to eat pizza. " +
    "I am very helpful and kind. I like to teach English." +
    "\n(GrapeSEED is a fun and engaging, oral language acquisition curriculum that provides a bridge to reading and writing skills. " +
    "We are a company that is passionate about transforming children's and teachers' lives by empowering them with excellent English oral language instruction and skills.)" +
    "\n\nStudent: Hello Ms. Cindy!" +
    "\nCindy: Hello! How are you today?" +
    "\nStudent: I feel great" +
    "\nCindy: "
let start_sequence = "\nCindy: "
let restart_sequence = "\nStudent: "

let query = async (body) => {
    const fmQuestion = body['fm-question'] //question asked by user
    const fmConversation = body['fm-conversation'] //string passed in previous response 'converationPayload'
    const fmAvatar = JSON.parse(body['fm-avatar']) //contextual information, 'type' is 'WELCOME' or 'QUESTION'
    const fmType = fmAvatar.type

    let conversationPayload = {}
    let platformSessionId = ''
    let response = {}
    let instructions = {}
    let answer = ''

    switch (fmType) {
        /* The 'type' field in 'fm-avatar' specifies if this is the beginning of a new conversation
         * with a persona ('WELCOME'), or the next request in a continuing conversation ('QUESTION') */
        case 'WELCOME':
            logger.debug('Type is WELCOME')
            sessionChatLog = ''
            response = 'Hello there! Welcome to the class!'
            conversationPayload = { platformSessionId: platformSessionId }
            break

        case 'QUESTION':
            logger.debug('Type is QUESTION')
            conversationPayload = JSON.parse(fmConversation)

            /* Assemble the prompt */
            userPrompt = `${sessionChatLog}${restart_sequence}${fmQuestion}${start_sequence}`
            console.log(userPrompt)

            /* GET the response */
            response = await getOpenAIResponse(userPrompt)

            logger.info('Got OpenAI response')
            logger.debug(`Raw OpenAI response: ${JSON.stringify(response)}`)
    }

    /* Parse the result */
    answer = await format.parseAnswer(response)
    console.log(answer)

    /* Add the result to the chat log */
    if (sessionChatLog === '') {
        sessionChatLog = `${initialPrompt}${answer}`;
    } else {
        sessionChatLog = `${userPrompt}${answer}`;
    }

    /* Return the result */
    return format.responseJSON(answer, instructions, conversationPayload)
}

let getOpenAIResponse = async (prompt) => {
    const gptResponse = await openai.complete({
        engine: 'davinci',
        prompt: prompt,
        temperature: 0.9,
        maxTokens: 150,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0.6,
        stop: ["\n", "Student:", "Cindy:"]
    })
    return gptResponse.data.choices[0].text
}

module.exports = {
    query,
}