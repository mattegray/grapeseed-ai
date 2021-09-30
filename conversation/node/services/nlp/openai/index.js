const logger = require('../../../utils/logger')
const format = require('../../lib/format')
const responses = require('./responses')

// OpenAI
const OpenAI = require('openai-api')
const {incorrectAnswer} = require("./responses");
const openai = new OpenAI(process.env.OPENAI_API_KEY)

const components = ['WELCOME', 'SevenGoodDays', 'TheSun', 'ThreeEggs', 'WhatIsThat', 'BettyBird', 'JanuarytoDecember', 'TEN', 'TheBallGame', 'PhonogramWords', 'GOODBYE', '']

let sessionChatLog
let whatIsThatLog = ''
let userPrompt

let start_sequence = "\nCindy:"
let restart_sequence = "\nStudent: "

let questionAnswered = false
let questionAsked = false
let questionNumber = 0
let wrongAnswerCount = 0
let turnPage = " Let's get going. *"
let counter = 0
let response = ''
let instructions = {}
let conversationPayload = {}
let platformSessionId = ''

let query = async (body) => {
    const fmQuestion = body['fm-question'] //question asked by user
    const fmConversation = body['fm-conversation'] //string passed in previous response 'conversationPayload'
    const fmAvatar = JSON.parse(body['fm-avatar']) //contextual information, 'type' is 'WELCOME' or 'QUESTION'
    const fmType = fmAvatar.type

    switch (fmType) {
        /* The 'type' field in 'fm-avatar' specifies if this is the beginning of a new conversation
         * with a persona ('WELCOME'), or the next request in a continuing conversation ('QUESTION') */
        case 'WELCOME':
            logger.debug('Type is WELCOME')
            sessionChatLog = ''
            response = "Hi there. Welcome to the class! Let's get started."
            conversationPayload = { platformSessionId: platformSessionId, component: 'WELCOME' }
            break

        case 'QUESTION':
            logger.debug('Type is QUESTION')

            conversationPayload = JSON.parse(fmConversation)
            let fmComponent = conversationPayload.component

            /* Change the conversationPayload component based on the incoming message */
            switch (fmQuestion) {
                case 'WELCOME':
                    conversationPayload.component = components[0]
                    counter = 0
                    break
                case 'SevenGoodDays':
                    conversationPayload.component = 'SevenGoodDays'
                    counter = 0
                    break
                case 'TheSun':
                    conversationPayload.component = 'TheSun'
                    counter = 0
                    break
                case 'FunAndBalloons':
                    conversationPayload.component = 'TheSun'
                    counter = 0
                    break
                case 'WhatIsThat':
                    conversationPayload.component = components[4]
                    counter = 0
                    break
                case 'BettyBird':
                    conversationPayload.component = components[5]
                    counter = 0
                    break
                case 'JanuarytoDecember':
                    conversationPayload.component = components[6]
                    counter = 0
                    break
                case 'TEN':
                    conversationPayload.component = components[7]
                    counter = 0
                    break
                case 'TheBallGame':
                    conversationPayload.component = components[8]
                    counter = 0
                    break
                case 'PhonogramWords':
                    conversationPayload.component = components[9]
                    counter = 0
                    break
                case 'GOODBYE':
                    conversationPayload.component = components[10]
                    counter = 0
                    break
                default:
            }
            fmComponent = conversationPayload.component

            /* Return preset utterances 'lessons' for each component */
            switch (fmComponent) {
                case 'SevenGoodDays':
                    await askQuestions(responses.SevenGoodDays, fmQuestion)
                    break
                case 'TheSun':
                    await askQuestions(responses.TheSun, fmQuestion)
                    break
                case 'WhatIsThat':
                    await askQuestions(responses.WhatIsThat, fmQuestion)
                    break
                case 'BettyBird':
                    await iterateResponses(fmComponent, responses.BettyBird_responses, 5)
                    break
                case 'JanuarytoDecember':
                    await iterateResponses(fmComponent, responses.JanuaryToDecember_responses, 6)
                    break
                case 'TEN':
                    await iterateResponses(fmComponent, responses.Ten_responses, 7)
                    break
                case 'TheBallGame':
                    await iterateResponses(fmComponent, responses.TheBallGame_responses, 8)
                    break
                case 'PhonogramWords':
                    await iterateResponses(fmComponent, responses.PhonogramWords_responses, 9)
                    break
                default:
                    /* Assemble the prompt */
                    userPrompt = `${sessionChatLog}${restart_sequence}${fmQuestion}${start_sequence}`
                    console.log(userPrompt)

                    /* GET the response */
                    response = await getOpenAIResponse(userPrompt)

                    logger.info('Got OpenAI response')
                    logger.debug(`Raw OpenAI response: ${JSON.stringify(response)}`)
            }
            fmComponent = conversationPayload.component
    }

    /* Parse the result */
    let answer = await format.parseAnswer(response)
    console.log(answer)

    /* Add the result to the chat log */
    if (sessionChatLog === '') {
        sessionChatLog = `${responses.initialPrompt}${answer}`
    } else {
        sessionChatLog = `${userPrompt}${answer}`
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

 /* Go through the utterances of each lesson component */
async function iterateResponses(component, utterances, n) {
    if (counter < utterances.length) {
        response = utterances[counter]
        counter ++
    } else {
        counter = 0
        response = "Alright, great work. *"
        conversationPayload.component = components[n+1]
        if (conversationPayload.component === 'GOODBYE') {
            response = "Great work! That's it for today! *"
        }
    }
    return response
}

async function askQuestions(component, question) {
    if (questionAsked === false) {
        response = component[questionNumber].question
        questionAsked = true
        console.log("Asked question")
        return response
    }
    while (questionAnswered === false) {
        if (component[questionNumber].answer.some(word => question.includes(word))) {
            response = `${component[questionNumber].response}${turnPage}`
            questionAnswered = true
            questionAsked = false
            console.log("Correct answer")
        } else {
            response = responses.incorrectAnswer[Math.floor(Math.random()*incorrectAnswer.length)]
            wrongAnswerCount++
            console.log("Incorrect answer")
        }
        if (wrongAnswerCount === 2) {
            response = component[questionNumber].response
            wrongAnswerCount = 0
            questionNumber++
            questionAsked = false
            console.log("Next question")
        }
        if (questionNumber >= component.length) {
            response = `${response}${turnPage}`
            questionAnswered = true
            questionNumber = 0
            console.log("Next component")
        }
        return response
    }
}

module.exports = {
    query
}