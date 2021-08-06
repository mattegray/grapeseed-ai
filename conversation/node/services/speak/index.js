const logger = require('../../utils/logger')
const loaders = require('../../loaders')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const format = require('../lib/format')
const validation = require('../lib/validation')

/**
 * Calls the UneeQ speak API to push an unsolicited response for the digital human to provide
 * during a conversation. Returns a status code - 204 indicates the request was successful in
 * which case the digital human will have spoken the request
 *
 * @param {object} body - JSON payload containinng the speak request
 * @return {string} stringified JSON containing the response status
 */
let push = async (body) => {
    let uneeqSpeakURL = process.env.SPEAK_UNEEQ_URL + process.env.SPEAK_UNEEQ_ROUTE
    let uneeqJWTSecret = process.env.SPEAK_UNEEQ_JWTSECRET

    try {
        if (validation.isValidPushRequest(body) && loaders.isValidSpeakConfig()) {
            /* This API requires a JSON with three fields, which correspond to the fields in
             * the UneeQ specification for the speak API. 'answer' contains a string with the
             * dialog for the digital human to speak, 'answerAvatar' contains an instructions
             * payload that conforms to the specification for platform instructions, and
             * 'sessionId' contains the encoded ID for an in-progress conversation with a digital human
             * (as contained in the avatarSessionId field in a properly formed request) */

            let requestSessionId = jwt.verify(body.sessionId, uneeqJWTSecret)
            if (!requestSessionId.hasOwnProperty('sessionId')) {
                throw new error('Decoded sessionId payload did not contain a sessionId field')
            }

            let speakURL = uneeqSpeakURL + requestSessionId.sessionId + '/speak'
            let headers = { headers: { 'content-type': 'application/json' } }

            /* The answer and instructions are parsed using the same methods as for the NLP
             * services, and the sessionId is added to a JSON object which is signed as per the
             * specification */
            let answer = await format.parseAnswer(body.answer)
            let answerAvatar = JSON.parse(body.answerAvatar)
            let instructions = {
                instructions: await format.parseInstructions(JSON.stringify(answerAvatar.instructions)),
            }

            let sessionId = { sessionId: requestSessionId.sessionId }

            let speakBody = {
                answer: answer,
                answerAvatar: JSON.stringify(instructions),
                sessionIdJwt: jwt.sign(sessionId, uneeqJWTSecret),
            }

            logger.debug(`Sending speak payload ${JSON.stringify(speakBody)} to ${speakURL}`)
            let speakResponse = await axios.post(speakURL, speakBody, headers)

            let response = { status: speakResponse.status }
            if (speakResponse.status == '204') {
                logger.info('Speak request succeeded with status 204')
            }

            return JSON.stringify(response)
        }
    } catch (error) {
        throw error
    }
}

module.exports = { push }
