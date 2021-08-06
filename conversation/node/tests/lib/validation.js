const logger = require('../../utils/logger')

/**
 * Validates the JSON returned by the middleware for the tested route
 *
 * @param {object} response - response from the NLP service
 * @return {boolean}
 */
let isValidResponseJSON = (response) => {
    var i = 0

    try {
        // Validate that the response JSON contains the three required top level fields
        let responseJSON = JSON.parse(response.text)
        logger.debug(`TEST: Response JSON to be validated: ${JSON.stringify(responseJSON)}`)
        let response_keys = objectDeepKeys(responseJSON)
        let requiredFields = ['answer', 'matchedContext', 'conversationPayload']
        for (i = 0; i < requiredFields.length; i++) {
            if (!response_keys.includes(requiredFields[i])) {
                throw new Error(`Response JSON does not contain ${requiredFields[i]} field`)
            }
        }
        logger.debug('TEST: Found all required top level fields in response JSON')

        // Validate that the answer field contains stringified JSON, containing answer and instruction fields
        let answerJSON = JSON.parse(responseJSON.answer)
        logger.debug(`TEST: Answer JSON to be validated: ${JSON.stringify(answerJSON)}`)
        let answer_keys = objectDeepKeys(answerJSON)
        let requiredAnswerFields = ['answer', 'instructions']
        for (i = 0; i < requiredAnswerFields.length; i++) {
            if (!answer_keys.includes(requiredAnswerFields[i])) {
                throw new Error(`Answer JSON does not contain ${requiredAnswerFields[i]} field`)
            }
        }
        logger.debug('TEST: Found required answer and instructions fields in answer JSON')

        // Validate that recognised instruction fields contain correct parameters
        let instructionsKeys = objectDeepKeys(answerJSON.instructions)
        if (instructionsKeys.length > 0) {
            logger.debug('TEST: Found fields in instructions JSON')
            if (instructionsKeys.includes('displayHtml')) {
                if (!instructionsKeys.includes('displayHtml.html')) {
                    throw new Error('Required parameter html not found in displayHtml instruction')
                }
            }
            if (instructionsKeys.includes('extraHintPhrases')) {
                if (!instructionsKeys.includes('extraHintPhrases.phrases')) {
                    throw new Error('Required parameter phrases not found in extraHintPhrases instruction')
                }
            }
            if (instructionsKeys.includes('privateDataFilter')) {
                if (!instructionsKeys.includes('privateDataFilter.enabled')) {
                    throw new Error('Required parameter enabled not found in privateDataFilter instruction')
                }
            }
        }

        // Validate that the conversationPayload field contains a platformSessionId parameter
        let conversationPayload = JSON.parse(responseJSON.conversationPayload)
        if (!conversationPayload.hasOwnProperty('platformSessionId')) {
            throw new Error('Conversation Payload field does not contain a platformSessionId parameter')
        }

        logger.debug('TEST: Passed: Response JSON is valid')
        return true
    } catch (error) {
        logger.error(`TEST: Failed: Response JSON is invalid: ${error.message}`)
        return false
    }
}

/**
 * Validates the token JSON returned by the token middleware
 *
 * @param {object} response - response from the token service
 * @return {boolean}
 */
let isValidTokenJSON = (response) => {
    try {
        let response_keys = objectDeepKeys(response)
        if (!response_keys.includes('body.token')) {
            throw new Error('Token response does not contain a token field')
        }
        if (!response.body.token) {
            throw new Error('Body parameter of token cannot be empty')
        }
        return true
    } catch (error) {
        logger.error(`TEST: Failed: Token JSON is invalid: ${error.message}`)
        return false
    }
}

let objectDeepKeys = (obj) => {
    return Object.keys(obj)
        .filter((key) => obj[key] instanceof Object)
        .map((key) => objectDeepKeys(obj[key]).map((k) => `${key}.${k}`))
        .reduce((x, y) => x.concat(y), Object.keys(obj))
}

module.exports = {
    isValidResponseJSON,
    isValidTokenJSON,
}
