const logger = require('../../../utils/logger')
const format = require('../../lib/format')
const responses = require('./responses')

// OpenAI
const OpenAI = require('openai-api')
const {incorrectAnswer} = require("./responses");
const openai = new OpenAI(process.env.OPENAI_API_KEY)

const components = ['WELCOME', 'SevenGoodDays', 'TheSun', 'ThreeEggs', 'WhatIsThat', 'BettyBird', 'JanuarytoDecember', 'TEN', 'TheBallGame', 'PhonogramWords', 'GOODBYE', '']

let sessionChatLog
let userPrompt

let start_sequence = "\nCindy:"
let restart_sequence = "\nStudent: "

let questionAnswered = false
let questionAsked = false
let questionNumber = 0
let wrongAnswerCount = 0
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
            response = "<uneeq:excited>Hi there. Welcome to the class! Let's get started.</uneeq:excited>"
            conversationPayload = { platformSessionId: platformSessionId, component: 'WELCOME' }
            break

        case 'QUESTION':
            logger.debug('Type is QUESTION')

            conversationPayload = JSON.parse(fmConversation)
            let fmComponent = conversationPayload.component

            /* Change the conversationPayload component based on the incoming message */
            switch (fmQuestion) {
                case 'WELCOME':
                    conversationPayload.component = 'WELCOME'
                    break
                case 'SevenGoodDays':
                    conversationPayload.component = 'SevenGoodDays'
                    break
                case 'TheSun':
                    conversationPayload.component = 'TheSun'
                    break
                case 'FunAndBalloons':
                    conversationPayload.component = 'FunAndBalloons'
                    break
                case 'WhatIsThat':
                    conversationPayload.component = 'WhatIsThat'
                    break
                case 'BettyBird':
                    conversationPayload.component = 'BettyBird'
                    break
                case 'JanuarytoDecember':
                    conversationPayload.component = 'JanuarytoDecember'
                    break
                case 'TEN':
                    conversationPayload.component = 'TEN'
                    break
                case 'TheBallGame':
                    conversationPayload.component = 'TheBallGame'
                    break
                case 'Phonics':
                    conversationPayload.component = 'Phonics'
                    break
                case 'GOODBYE':
                    conversationPayload.component = 'GOODBYE'
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
                case 'FunAndBalloons':
                    await moveOn()
                    break
                case 'WhatIsThat':
                    await askQuestions(responses.WhatIsThat, fmQuestion)
                    break
                case 'BettyBird':
                    await askQuestions(responses.BettyBird, fmQuestion)
                    break
                case 'JanuarytoDecember':
                    await askQuestions(responses.JanuaryToDecember, fmQuestion)
                    break
                case 'TEN':
                    await askQuestions(responses.Ten, fmQuestion)
                    break
                case 'TheBallGame':
                    await askQuestions(responses.TheBallGame, fmQuestion)
                    break
                case 'Phonics':
                    await moveOn()
                    break
                case 'GOODBYE':
                    response = "Great work! That is it for today! Do you have any questions?"
                    conversationPayload.component = ''
                    break
                default:
                    /* Initialize the chat log */
                    if (sessionChatLog === '') {
                        sessionChatLog = `${responses.initialPrompt}${response}`
                    }

                    /* Assemble the prompt */
                    userPrompt = `${sessionChatLog}${restart_sequence}${fmQuestion}${start_sequence}`
                    console.log(userPrompt)

                    /* GET the response */
                    response = await getOpenAIResponse(userPrompt)

                    /* Add the result to the chat log */
                    sessionChatLog = `${userPrompt}${response}`

                    logger.info('Got OpenAI response')
                    logger.debug(`Raw OpenAI response: ${JSON.stringify(response)}`)
            }
            fmComponent = conversationPayload.component
    }

    /* Parse the result */
    let answer = await format.parseAnswer(response)
    console.log(answer)

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

async function moveOn() {
    response = responses.moveOn[counter]
    return response
}

async function askQuestions(component, question) {
    if (counter >= 5) {
        counter = 0
    }
    if (questionAsked === false) {
        response = `${responses.beginning[counter]}${component[questionNumber].question}`
        questionAsked = true
        console.log("Asked question")
        return response
    }
    while (questionAnswered === false) {
        if (component[questionNumber].answer.some(word => question.toLowerCase().includes(word.toLowerCase()))) {
            response = `${responses.correctAnswer[counter]}${component[questionNumber].response}${responses.moveOn[counter]}`
            questionAsked = false
            questionNumber = 0
            console.log("Correct answer")
        } else {
            response = responses.incorrectAnswer[counter]
            wrongAnswerCount++
            console.log("Incorrect answer")
        }
        if (wrongAnswerCount === 2) {
            response = `${responses.incorrectAnswer[counter]}${component[questionNumber].response}`
            wrongAnswerCount = 0
            questionNumber++
            questionAsked = false
            console.log("Next question")
        }
        if (questionNumber >= component.length) {
            response = `${response}${responses.moveOn[counter]}`
            questionNumber = 0
            console.log("Next component")
        }
        counter++
        return response
    }
}

module.exports = {
    query
}