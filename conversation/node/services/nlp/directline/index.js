const logger = require('../../../utils/logger')
const format = require('../../lib/format')

// This module uses axios for POSTs to the Directline API once the session is established
const axios = require('axios')
const directLineURI = 'https://directline.botframework.com/v3/directline/conversations'
let headers = { headers: { Authorization: `Bearer ${process.env.DIRECTLINE_CONFIG_SECRET}` } }

// The Directline modules are used to pass the 'invoke' payload when starting a new conversation
XMLHttpRequest = require('xhr2')
WebSocket = require('ws')
const { DirectLine } = require('botframework-directlinejs')

/**
 * Calls three functions that encapsulate the Directline API. The methods startConversation
 * and postActivity are used to post requests for WELCOME and QUESTION requests respectively,
 * and getActivity reads the resulting messages from the Directline stream. The Directline API
 * uses the concept of watermarks as the activity stream is appended with new messages, instead
 * of being cleared between requests. The resulting message is parsed to replace a series of
 * string patterns that are specific to Bot Framework where bots are written for on screen use.
 *
 * @param {object} body The request JSON from UneeQ
 * @return {string} Stringified JSON containing response
 */
let query = async (body) => {
    const fmQuestion = body['fm-question'] //question asked by user
    const fmConversation = body['fm-conversation'] //string passed in previous response 'converationPayload'
    const fmAvatar = JSON.parse(body['fm-avatar']) //contextual information, 'type' is 'WELCOME' or 'QUESTION'
    const fmType = fmAvatar.type
    const fmAvatarSessionId = fmAvatar.avatarSessionId

    let platformSessionId = ''
    let watermark = 0
    let conversationPayload = {}

    /* Prepare and execute the queries */
    switch (fmType) {
        case 'WELCOME':
            logger.debug('Type is WELCOME')
            platformSessionId = await startConversation(fmAvatarSessionId)
            conversationPayload = { platformSessionId: platformSessionId }
            logger.info(`Got new Directline session: ${platformSessionId}`)
            break

        case 'QUESTION':
            logger.debug('Type is QUESTION')
            conversationPayload = JSON.parse(fmConversation)
            platformSessionId = conversationPayload.platformSessionId

            let activityId = await postActivity(fmAvatarSessionId, platformSessionId, fmQuestion)
            watermark = parseInt(activityId.data.id.split('|')[1])
            logger.info(`Directline postActivity returned watermark ${watermark}`)
    }

    /* Directline interactions are asynchronous, so the result of the WELCOME or QUESTION cases
     * is a conversation ID, and a watermark (an integer that represents the place in the activity
     * sequence of the last request - the getActivities method uses the watermark to identify the
     * starting point in the activity stream to start parsing new messages, which are the response
     * from the bot)
     */
    let activityDialog = await getActivities(platformSessionId, watermark)
    logger.debug(`Raw Directline response beginning at watermark ${watermark}: ${activityDialog}`)
    let response = parseResponse(activityDialog)
    logger.debug(`Parsed Directline response: ${response}`)

    let answer = await format.parseAnswer(response)
    return format.responseJSON(answer, {}, conversationPayload)
}

/**
 * Bot Framework responses are typically written for on-screen rendering, especially templated
 * interactions like those in the Healthcare Bot. Interface cues like 'Yes' or 'No' are rendered
 * in the 'speak' field in a predictable way, along with option lists. The purpose of this series
 * of regexp calls is to tidy these for speech rendering.
 *
 * @param {string} response The raw response string from Directline
 * @return {string} Parsed response string with patterns replaced
 */
let parseResponse = (response) => {
    let parsedResponse = response

    let botFrameworkStringPatterns = [
        { string: '(\r\n-|\n-|\r-)', replaceWith: ', ' },
        { string: '(\r\n|\n|\r)', replaceWith: ' ' },
        { string: '(: ,)', replaceWith: ';' },
        { string: '<break/>', replaceWith: ' ' },
        { string: '\\[911\\]\\(tel:911\\)', replaceWith: '911' },
        {
            string: ' Select one of the following options:  1. Yes 2. Not to my knowledge',
            replaceWith: '. Please respond with yes, or not to my knowledge.',
        },
        {
            string: ' Select one of the following options:  1. Yes 2. No',
            replaceWith: '. Please respond with yes or no.',
        },
        { string: '  ', replaceWith: ' ' },
    ]

    for (i = 0; i < botFrameworkStringPatterns.length; i++) {
        var re = new RegExp(`${botFrameworkStringPatterns[i].string}`, 'gm')
        parsedResponse = parsedResponse.replace(re, `${botFrameworkStringPatterns[i].replaceWith}`)
    }

    return parsedResponse
}

/**
 * The Directline API is asynchronous, so after using postActivity to either begin a new
 * conversation or ask a question, the activity stream must be read to get the responses. The
 * activity stream is appended to on each request, and postActivity always returns an ID which
 * is the requests place in the stream. This routine parses the activity stream starting at the
 * watermark position, and takes all message payloads and concatenates the speak or text fields
 * and returns the result
 *
 * @param {string} platformSessionId The Directline conversation ID
 * @param {int} watermark The array index of the last request activity, which is the starting point for parsing
 * @return {string} Concatenated strings from all messages in the activity stream after the watermark
 */
let getActivities = async (platformSessionId, watermark) => {
    let dialog = ''

    const activitiesURI = `${directLineURI}/${platformSessionId}/activities`
    const activityResponse = await axios.get(activitiesURI, headers)
    const activities = activityResponse.data.activities

    for (i = watermark + 1; i < activities.length; i++) {
        if (activities[i].type == 'message') {
            if (activities[i].hasOwnProperty('speak')) {
                dialog += ` ${activities[i].speak}`
            } else {
                dialog += ` ${activities[i].text}`
            }
        }
    }

    return dialog
}

/**
 * Calls the Directline activities API, with a message payload containing the question
 * asked by the user - the response is the raw response object, with a data payload that
 * contains the ID returned by Directline, which is this request's place in the activity
 * stream (used by the getActivities method to identify the starting point for parsing)
 *
 * @param {string} avatarSessionId The UneeQ session ID
 * @param {string} conversationId The Directline conversation ID
 * @param {string} question The question asked by the end user
 * @return {object} Response to the POST request to postActivity
 */
let postActivity = async (avatarSessionId, conversationId, question) => {
    let botLocale = process.env.DIRECTLINE_CONFIG_LOCALE

    activityPayload = {
        locale: botLocale,
        type: 'message',
        from: {
            id: avatarSessionId,
        },
        text: question,
    }
    let activitiesURI = `${directLineURI}/${conversationId}/activities`
    headers.headers['Content-Type'] = 'application/json'

    let activityStatus = await axios.post(activitiesURI, activityPayload, headers)

    return activityStatus
}

/**
 * Starting a new Directline conversation and triggering a scenario, so the user is greeted
 * rather than having to start the conversation, requires the postActivity method to be called
 * with a payload of type 'invoke' with the value field containing a trigger object with the
 * name of the scenario. If successful, this method returns an ID for the new conversation,
 * and the asynchronous activity stream will contain the triggered intent/node response
 *
 * @param {string} avatarSessionId
 * @return {string} Directline conversation ID for the new conversation session
 */
let startConversation = async (avatarSessionId) => {
    let triggerScenario = process.env.DIRECTLINE_CONFIG_SCENARIO
    let botLocale = process.env.DIRECTLINE_CONFIG_LOCALE

    var directLine = new DirectLine({
        secret: process.env.DIRECTLINE_CONFIG_SECRET,
    })

    let welcomePayload = {
        from: { id: avatarSessionId },
        type: 'invoke',
        value: { trigger: triggerScenario },
        locale: botLocale,
        name: 'TriggerScenario',
    }

    let welcomeMessageId = await directLine.postActivity(welcomePayload).toPromise()

    return welcomeMessageId.split('|')[0]
}

module.exports = {
    query,
}
