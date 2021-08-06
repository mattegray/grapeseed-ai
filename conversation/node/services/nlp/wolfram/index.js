const logger = require('../../../utils/logger')
const format = require('../../lib/format')

/* The Wolfram modules have been avoided for this module - the API only
 * requires a GET with an API key in the querystring, so preferring axios
 * (which handles parsing) to handle GET requests */
const axios = require('axios')

/**
 * Calls the Wolfram Alpha conversation API via a GET, then parses the response to
 * extract dialog, and returns a JSON that complies with the UneeQ response
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

    let conversationPayload = {}
    let question = ''
    let response = {}
    let instructions = {}
    let answer = ''
    let dialog = ''
    let queryURL = ''

    switch (fmType) {
        /* The 'type' field in 'fm-avatar' specifies if this is the beginning of a new conversation
         * with a persona ('WELCOME'), or the next request in a continuing conversation ('QUESTION') */
        case 'WELCOME':
            logger.debug('Type is WELCOME')

            /* Assemble the queryURL */
            queryURL = `${process.env.WOLFRAM_CONFIG_APIBASEURL}${process.env.WOLFRAM_CONFIG_APIROUTE}${process.env.WOLFRAM_CONFIG_APPID}`
            queryURL += `&${process.env.WOLFRAM_CONFIG_QUERYPARAM}=${fmType}`
            logger.debug(`Welcome query to ${queryURL}`)

            /* GET the response */
            response = await getWolframResponse(queryURL)

            /* For the welcome event, use the env defined greeting, and create the conversationPayload
             * Wolfram uses continuously updating conversationIDs and hosts, which maintain context */
            dialog = process.env.WOLFRAM_CONFIG_GREETING
            conversationPayload = { platformSessionId: response.conversationID, host: response.host }
            break

        case 'QUESTION':
            logger.debug('Type is QUESTION')

            /* Assemble the queryURL - to maintain context (for follow-on questions) Wolfram
             * requires that the host and session parameter returned in the response to the previous
             * GET request are used */
            conversationPayload = JSON.parse(fmConversation)
            question = encodeURI(fmQuestion)
            let wolframSessionId = conversationPayload.platformSessionId
            let wolframHost = conversationPayload.host

            queryURL = `https://${wolframHost}/api${process.env.WOLFRAM_CONFIG_APIROUTE}${process.env.WOLFRAM_CONFIG_APPID}`
            queryURL += `&${process.env.WOLFRAM_CONFIG_SESSIONPARAM}=${wolframSessionId}`
            queryURL += `&${process.env.WOLFRAM_CONFIG_QUERYPARAM}=${question}`
            logger.debug(`Question query to ${queryURL}`)

            /* GET the response */
            response = await getWolframResponse(queryURL)

            /* Capture the result and prepare the conversation payload to maintain context */
            dialog = response.result
            conversationPayload.platformSessionId = response.conversationID
            conversationPayload.host = response.host
    }

    answer = await format.parseAnswer(dialog)
    return format.responseJSON(answer, instructions, conversationPayload)
}

/**
 * Issues a GET request to the URL passed in the parameter and returns either the
 * response or the 'not found' message defined in the environment vars if the query
 * does not produce a result
 *
 * @param {string} queryURL The URL for the GET request to Wolfram
 * @return {string} response from Wolfram Alpha or not found message
 */
let getWolframResponse = async (queryURL) => {
    let response = await axios.get(queryURL)

    if (response.data.hasOwnProperty('error')) {
        response.data.result = process.env.WOLFRAM_CONFIG_NOTFOUNDMSG
        logger.info(`No answer found for ${queryURL}`)
    } else {
        logger.info('Got WolframAlpha response')
        logger.debug(`Raw WolframAlpha response: ${JSON.stringify(response.data)}`)
    }

    return response.data
}

module.exports = {
    query,
}
