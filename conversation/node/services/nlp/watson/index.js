const logger = require('../../../utils/logger')
const format = require('../../lib/format')
const lodash = require('lodash')

// Require watson modules - v2 API
const { IamAuthenticator } = require('ibm-watson/auth')
const AssistantV2 = require('ibm-watson/assistant/v2')

/**
 * Calls the Watson v2 API using the message method, then parses the response to
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
    let conversationPayload = {}
    let platformSessionId = ''

    const watsonIAMAPIKey = process.env.WATSON_CONFIG_IAMAPIKEY
    const watsonAssistantId = process.env.WATSON_CONFIG_ASSISTANTID
    const watsonEndpointURI = process.env.WATSON_CONFIG_ENDPOINTURI
    let assistant = new AssistantV2({
        headers: { 'X-Watson-Learning-Opt-Out': true },
        authenticator: new IamAuthenticator({ apikey: watsonIAMAPIKey }),
        serviceUrl: watsonEndpointURI,
        version: '2020-02-05',
    })

    switch (fmType) {
        /* The 'type' field in 'fm-avatar' specifies if this is the beginning of a new conversation
         * with a persona ('WELCOME'), or the next request in a continuing conversation ('QUESTION') */
        case 'WELCOME':
            logger.debug('Type is WELCOME')
            /* Watson uses its own session_id to maintain conversation state - the createSession method
             * returns a session_id which is used for the call to the messaage method, and added to the
             * conversationPayload so it is returned with the next request  */
            const session = await assistant.createSession({ assistantId: watsonAssistantId })
            platformSessionId = session.result.session_id
            conversationPayload = { platformSessionId: platformSessionId }
            break
        case 'QUESTION':
            logger.info('Type is QUESTION')
            conversationPayload = JSON.parse(fmConversation)
            platformSessionId = conversationPayload.platformSessionId
    }

    /* Execute the query */
    let watsonMessage = await assistant.message({
        input: { text: fmQuestion, options: { alternate_intents: true, return_context: true } },
        context: conversationPayload,
        sessionId: platformSessionId,
        assistantId: watsonAssistantId,
    })
    let response = watsonMessage.result
    logger.info('Got Watson sendRequest response')
    logger.debug(`Raw Watson sendRequest response: ${JSON.stringify(response)}`)

    /* Parse the result and return */
    let { answer, instructions } = await parseResponse(response)
    return format.responseJSON(answer, instructions, conversationPayload)
}

/**
 * Parses the result field from the response to the message method, to extract the dialog
 * that will be spoken by the digital human, and any instruction payloads that have been defined as
 * parameters in the matched intent, and returns an answer string and instructions JSON for the response payload.
 *
 * @param {object} response The response JSON from Watson
 * @return {string} answer and instructions (stringified JSON)
 */
let parseResponse = async (response) => {
    let answer = ''
    let instructions = {}

    if (response.output.generic.length > 0) {
        /* Responses from Watson are passed as an array in the output.generic field */
        for (var i = 0; i < response.output.generic.length; i++) {
            genericResponse = response.output.generic[i]

            switch (genericResponse.response_type) {
                /* This API handles four response types from Watson, which are the response
                 * types that can be chosen by the author when creating a Watson skill. The
                 * 'text' and 'option' types are defined in each node, the 'search' type is returned
                 * if the Assistant has an associated Discovery instance attached as a search skill
                 * and the node configured to return a search, and the 'suggestion' type is
                 * returned when the disambiguation feature is triggered */
                case 'text':
                    answer += `${genericResponse.text} `
                    break
                case 'search':
                    if (genericResponse.results.length > 0) {
                        answer += `${genericResponse.header} ${genericResponse.results[0].body} `
                    }
                    break
                case 'option':
                    for (var j = 0; j < genericResponse.options.length; j++) {
                        answer += `${genericResponse.options[j].label} is ${genericResponse.options[j].value.input.text} `
                    }
                    break
                case 'suggestion':
                    answer += `${genericResponse.title} `
                    for (var k = 0; k < genericResponse.suggestions.length; k++) {
                        if (k == genericResponse.suggestions.length - 1) {
                            answer += `or ${genericResponse.suggestions[k].label}`
                        } else {
                            answer += `${genericResponse.suggestions[k].label}, `
                        }
                    }
            }
        }
    }

    let responseInstructions = lodash.get(response.context.skills['main skill'], 'user_defined.instructions')
    if (responseInstructions) {
        instructions = format.parseInstructions(JSON.stringify(responseInstructions))
    }
    answer = await format.parseAnswer(answer)

    return { answer, instructions }
}

module.exports = {
    query,
}
