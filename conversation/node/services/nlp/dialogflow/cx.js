const logger = require('../../../utils/logger')
const format = require('../../lib/format')
const uuid = require('uuid')
const utils = require('../../../utils')

// Require dialogflow module - explicit v2beta1 API
const dialogflow = require('@google-cloud/dialogflow-cx')

/**
 * Calls the Dialogflow v2beta API using the detectIntent method, then parses the response to
 * extract dialog and instructions, and returns a JSON that complies with the UneeQ response
 * specification
 *
 * @param {object} body The request JSON from UneeQ
 * @return {string} Stringified JSON containing response
 */
let query = async (body) => {
    const fmQuestion = body['fm-question'] //question asked by user
    const fmConversation = body['fm-conversation'] //string passed in previous response 'converationPayload'
    const fmAvatar = JSON.parse(body['fm-avatar']) //contextual information, 'type' is 'WELCOME' or 'QUESTION'
    const fmType = fmAvatar.type

    /* Prepare the query */
    let queryInput = {}
    let conversationPayload = {}
    let platformSessionId = ''

    let credentialsJSON = JSON.parse(process.env.DIALOGFLOWCX_CONFIG_CREDENTIALS)
    const sessionClient = new dialogflow.SessionsClient({
        credentials: credentialsJSON,
    })
    let sessionPath = sessionClient.agentPath(
        process.env.DIALOGFLOWCX_CONFIG_PROJECTID,
        process.env.DIALOGFLOWCX_CONFIG_LOCATION,
        process.env.DIALOGFLOWCX_CONFIG_AGENT
    )

    switch (fmType) {
        /* The 'type' field in 'fm-avatar' specifies if this is the beginning of a new conversation
         * with a persona ('WELCOME'), or the next request in a continuing conversation ('QUESTION') */
        case 'WELCOME':
            logger.debug('Type is WELCOME')
            /* Create a session ID for the Dialogflow conversation and add to the conversationPayload
             * object - this is passed back with subsequent 'QUESTION' payloads in the fm-conversation field
             * so that session context can be maintained */
            platformSessionId = uuid.v4()
            conversationPayload = { platformSessionId: platformSessionId }
            queryInput.intent = {
                intent: `${sessionPath}/intents/00000000-0000-0000-0000-000000000000`,
            }
            break
        case 'QUESTION':
            logger.debug('Type is QUESTION')
            conversationPayload = JSON.parse(fmConversation)
            platformSessionId = conversationPayload.platformSessionId
            /* Dialogflow returns an error if an empty string is passed as the input text - replacing
             * the empty string with a single space triggers the fallback intent, so the end user hears a
             * fallback/clarification response */
            if (fmQuestion == '') {
                queryInput.text = { text: ' ' }
            } else {
                queryInput.text = { text: fmQuestion }
            }
    }
    queryInput.languageCode = process.env.DIALOGFLOWCX_CONFIG_PROJECTLANGUAGE

    sessionPath += `/environments/${process.env.DIALOGFLOWCX_CONFIG_ENVIRONMENT}/sessions/${platformSessionId}`
    let request = { session: sessionPath, queryInput: queryInput }

    /* Execute the query */
    const detectIntentResponses = await sessionClient.detectIntent(request)
    let response = detectIntentResponses[0].queryResult
    logger.info('Got Dialogflow detectIntent response')
    logger.debug(`Raw detectIntent response: ${JSON.stringify(response)}`)

    /* Parse the result and return */
    let { answer, instructions } = await parseResponse(response)
    return format.responseJSON(answer, instructions, conversationPayload)
}

/**
 * Parses the queryResult field from the response to the detectIntent method, to extract the dialog
 * that will be spoken by the digital human, and any instruction payloads that have been defined as
 * parameters in the matched intent, and returns an answer string and instructions JSON for the response payload.
 *
 * @param {object} response The response JSON from Dialogflow
 * @return {string} answer and instructions (stringified JSON)
 */
let parseResponse = async (response) => {
    let answer = ''
    let dialog = ''
    let instructions = {}

    /* The queryResult field contains the responses to the query in an array of responseMessages.
     * An array length greater than 1 occurs when multiple responses are defined for the intent, such
     * as additional text responses, or custom payloads. If the intent contains multiple text responses,
     * they are concatentated, and if the intent contains a custom payload with an instructions field,
     * it is parsed  */
    if (response.responseMessages.length > 1) {
        for (var i = 0; i < response.responseMessages.length; i++) {
            switch (response.responseMessages[i].message) {
                case 'text':
                    dialog += response.responseMessages[i].text.text[0]
                    break
                case 'payload':
                    /* This API implements custom payloads as the method for Dialogflow CX authors to associate platform instructions
                     * (such as displayHtml, etc) with intents - if present the contents are parsed to check for validity */
                    if (response.responseMessages[i].payload.fields.hasOwnProperty('instructions')) {
                        instructions = format.parseInstructions(
                            response.responseMessages[i].payload.fields.instructions.stringValue
                        )
                    }
            }
        }
    } else {
        dialog = response.responseMessages[0].text.text[0]
    }

    answer = await format.parseAnswer(dialog)

    return { answer, instructions }
}

module.exports = {
    query,
}
