const logger = require('../../../utils/logger')
const format = require('../../lib/format')
const uuid = require('uuid')

// Require aws module
const AWS = require('aws-sdk')
AWS.config.update({
    accessKeyId: process.env.LEX_CONFIG_ACCESSKEYID,
    secretAccessKey: process.env.LEX_CONFIG_SECRETACCESSKEY,
    region: process.env.LEX_CONFIG_AWSREGION,
})

/**
 * Calls the Lex API using the putSession method to begin a conversation and the
 * postText method to continue a conversation, then parses the response to extract
 * dialog and instructions, and returns a JSON that complies with the UneeQ response
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
    let response = {}
    let params = {
        botAlias: process.env.LEX_CONFIG_BOTALIAS,
        botName: process.env.LEX_CONFIG_BOTNAME,
        sessionAttributes: {},
    }

    /* Lex does not implement a 'welcome' event that fires when a new conversation begins.
     * Instead, Lex requires that a defined intent is passed with the query params using the
     * putSession method - setting the dialogAction parameter to a specified intent name
     * (the name of the intent is abstracted to the environment variables for flexibility)
     * will cause that intent to be returned, allowing the digital human to begin the conversation */
    let lexruntime = new AWS.LexRuntime()
    switch (fmType) {
        /* The 'type' field in 'fm-avatar' specifies if this is the beginning of a new conversation
         * with a persona ('WELCOME'), or the next request in a continuing conversation ('QUESTION') */
        case 'WELCOME':
            logger.debug('Type is WELCOME')
            /* Lex uses the userId field in the query params to maintain session state during a
             * conversation - the value is user-defined, and then passed in the conversationPayload
             * so that it is returned in the next request */
            params.userId = uuid.v4()
            params.accept = 'text/plain; charset=utf-8'
            params.dialogAction = {
                intentName: process.env.LEX_CONFIG_WELCOMEINTENT,
                type: 'Delegate',
            }
            conversationPayload = { platformSessionId: params.userId }

            response = await lexruntime.putSession(params).promise()

            logger.info('Got Lex putSession response')
            logger.debug(`Raw Lex putSession response: ${JSON.stringify(response)}`)
            break

        case 'QUESTION':
            logger.debug('Type is QUESTION')
            conversationPayload = JSON.parse(fmConversation)
            params.userId = conversationPayload.platformSessionId
            /* Lex returns an error if an empty string is passed as the input text - replacing
             * the empty string with a period triggers the fallback intent, so the end user hears a
             * fallback/clarification response */
            if (fmQuestion == '') {
                params.inputText = '.'
            } else {
                params.inputText = fmQuestion
            }

            response = await lexruntime.postText(params).promise()

            logger.info('Got Lex postText response')
            logger.debug(`Raw Lex postText response: ${JSON.stringify(response)}`)
    }

    /* Parse the result and return */
    let { answer, instructions } = await parseResponse(response)
    return format.responseJSON(answer, instructions, conversationPayload)
}

/**
 * Parses the message field from the response to the putSession or postText methods, to extract the dialog
 * that will be spoken by the digital human, and any instruction payloads that have been defined as
 * parameters in the matched intent, and returns an answer string and instructions JSON for the response payload.
 *
 * @param {object} response The response JSON from Lex
 * @return {string} answer and instructions (stringified JSON)
 */
let parseResponse = async (response) => {
    let answer = ''
    let instructions = {}
    let customPayload = {}
    let foundFirstCustomPayload = false
    let containsSSML = false

    switch (response.messageFormat) {
        case 'PlainText':
            answer = await format.parseAnswer(response.message)
            break
        case 'SSML':
            /* Lex will recognise properly formed SSML entered as a text response for an
             * intent, and automatically passes these responses as type 'SSML' - as this
             * has already been parsed by the Lex platform, the parseAnswer function (which
             * checks for structure validity and applies SSML) is not needed */
            answer = response.message
            break
        case 'Composite':
            /* The 'Composite' messageFormat is returned when the author has configured multiple
             * responses for the intent in Lex - in this case the message field contains an array
             * of the three message types. This API implements CustomPayload as the method for authors
             * to pass platform instructions */
            let compositeMessage = JSON.parse(response.message)
            var message = {}
            for (var i = 0; i < compositeMessage.messages.length; i++) {
                message = compositeMessage.messages[i]

                switch (message.type) {
                    case 'PlainText':
                        answer += `${message.value} `
                        break
                    case 'SSML':
                        answer += `${message.value.replace(/"/g, "'")} `
                        containsSSML = true
                        break
                    case 'CustomPayload':
                        if (!foundFirstCustomPayload) {
                            try {
                                customPayload = JSON.parse(message.value.replace(/(\r\n|\n|\r)/gm, ''))
                                instructions = format.parseInstructions(customPayload.instructions)
                                foundFirstCustomPayload = true
                            } catch (error) {
                                logger.info(`Could not parse custom payload: ${response}`)
                            }
                        } else {
                            logger.info(`Ignored additional custom payload: ${response}`)
                        }
                }
            }
            if (!containsSSML) {
                answer = await format.parseAnswer(answer)
            }
    }

    return { answer, instructions }
}

module.exports = {
    query,
}
