const logger = require('../../utils/logger')
const format = require('../lib/format')
const validation = require('../lib/validation')
const uuid = require('uuid')

/**
 * Echoes the value of 'fm-question' from a request payload (contains user input) in a response
 * payload. This allows the interface to be tested for the ability to receive a request and return
 * a response, in isolation from any dependent NLP services.
 *
 * @param {object} body - the body passed with the POST request
 * @return {string} Stringified JSON containing the response
 */
let repeat = async (body) => {
    let conversationPayload = {}
    let instructions = {}
    let dialog = ''

    try {
        if (validation.isValidRequestJSON(body)) {
            logger.debug('Request JSON is valid')
            const fmQuestion = body['fm-question'] //question asked by user
            const fmConversation = body['fm-conversation'] //string passed in previous response 'converationPayload'
            const fmAvatar = JSON.parse(body['fm-avatar']) //contextual information, 'type' is 'WELCOME' or 'QUESTION'
            const fmType = fmAvatar.type

            switch (fmType) {
                case 'WELCOME':
                    dialog = 'Welcome'
                    /* There is no concept of a 'session' with this service - creating a
                     * conversationPayload so the request/response JSON format is consistent */
                    conversationPayload = { platformSessionId: uuid.v4() }
                    break
                case 'QUESTION':
                    dialog = fmQuestion
                    conversationPayload = JSON.parse(fmConversation)
                    break
            }

            return format.responseJSON(dialog, instructions, conversationPayload)
        }
    } catch (error) {
        throw error
    }
}

module.exports = {
    repeat,
}
