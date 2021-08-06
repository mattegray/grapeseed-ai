/**
 * Checks the incoming JSON passed in the body of the POST request, and validates it against
 * the UneeQ request specification
 *
 * @param {object} body - the body passed with the POST request
 * @returns {boolean}
 */
let isValidRequestJSON = (body) => {
    try {
        /* The specification for the UneeQ request JSON defines five fields:
         *
         * sid: - {string} Your value identifying this conversation session as set when obtaining an access token
         * fm-custom-data - {string} Your ad-hoc values as set when when obtaining an access token
         * fm-question - {string} The question the user has asked your Digital Human
         * fm-conversation - {string} Your value passed to the Platform in any previous response relating to this session
         * fm-avatar - {string} Contextual data the Platform is passing, including "WELCOME" or "QUESTION" to denote conversation state
         *
         * The fm-conversation field is implemented by this API for passing session IDs for the NLP service back and forth so
         * conversation state can be maintained. When the 'type' field in fm-avatar contains 'QUESTION' (which means the conversation
         * is underway), this API requires a 'platformSessionId' to be present in fm-conversation or the validation will fail.
         * When adding new NLP services, this means the service must generate a session ID and populate the conversationPayload
         * response with a platformSessionId field.
         */

        // fm-avatar - must be present, must be a JSON string, must contain type and avatarSessionId, type must be welcome or question
        if (body.hasOwnProperty('fm-avatar')) {
            const fmAvatar = JSON.parse(body['fm-avatar'])
            if (fmAvatar.hasOwnProperty('type')) {
                if (!(fmAvatar.type == 'WELCOME' || fmAvatar.type == 'QUESTION')) {
                    throw new Error(`Invalid value '${fmAvatar.type}' in type field`)
                }
            } else {
                throw new Error('No type field in fm-avatar')
            }
            if (fmAvatar.hasOwnProperty('avatarSessionId')) {
                process.env.SESSION_ID = fmAvatar.avatarSessionId
            } else {
                process.env.SESSION_ID = 'None'
                throw new Error('No avatarSessionId field in fm-avatar')
            }
        } else {
            throw new Error('JSON does not contain fm-avatar field')
        }

        // fm-question = must be present, must not be null
        if (body.hasOwnProperty('fm-question')) {
            if (body['fm-question'] == null) {
                throw new Error('fm-question field contains null')
            }
        } else {
            throw new Error('JSON does not contain fm-question field')
        }

        // fm-conversation = must be present, if type is question must be a json with session field
        if (body.hasOwnProperty('fm-conversation')) {
            const fmAvatar = JSON.parse(body['fm-avatar'])
            if (fmAvatar.type == 'QUESTION') {
                if (!body['fm-conversation']) {
                    throw new Error('fm-conversation field contains null')
                }
                const fmConversation = JSON.parse(body['fm-conversation'])
                if (!fmConversation.hasOwnProperty('platformSessionId')) {
                    throw new Error('Conversation platform session ID not passed with QUESTION type')
                }
            }
        } else {
            throw new Error('JSON does not contain fm-conversation field')
        }
        return true
    } catch (error) {
        throw error
    }
}

/**
 * Checks that an incoming unsolicited speak request contains the three required fields for a speak request
 * to the UneeQ API
 *
 * @param {object} request
 * @return {boolean}
 */
let isValidPushRequest = (request) => {
    try {
        let requestKeys = objectDeepKeys(request)
        if (!requestKeys.includes('answer')) {
            throw new Error('Speak API request does not contain an answer field')
        }
        if (!requestKeys.includes('answerAvatar')) {
            throw new Error('Speak API request does not contain an answerAvatar field')
        }
        if (!requestKeys.includes('sessionId')) {
            throw new Error('Speak API request does not contain a sessionId field')
        }
        return true
    } catch (error) {
        throw error
    }
}

let objectDeepKeys = (obj) => {
    return Object.keys(obj)
        .filter((key) => obj[key] instanceof Object)
        .map((key) => objectDeepKeys(obj[key]).map((k) => `${key}.${k}`))
        .reduce((x, y) => x.concat(y), Object.keys(obj))
}

module.exports = {
    isValidRequestJSON,
    isValidPushRequest,
}
