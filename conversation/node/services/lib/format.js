const logger = require('../../utils/logger')
const xml2js = require('xml2js')
const utils = require('../../utils')
const Entities = require('html-entities').XmlEntities

/**
 * Returns a stringified JSON object compliant with the UneeQ response specification
 *
 * @param {string} answer - the dialog to be spoken by the digital human
 * @param {object} instructions - JSON object containing platform instructions
 * @param {object} conversationPayload - JSON object containing session data, is returned in fm-conversation in next request
 * @return {string} - Stringified JSON containing response
 */
let responseJSON = (answer, instructions, conversationPayload) => {
    let answerPayload = {
        answer: answer,
        instructions: instructions,
    }
    let responsePayload = JSON.stringify({
        answer: JSON.stringify(answerPayload),
        matchedContext: '',
        conversationPayload: JSON.stringify(conversationPayload),
    })

    logger.debug(`Response JSON: ${responsePayload}`)
    return responsePayload
}

/**
 * Parses an instructions string returned with a response from an NLP service, and
 * extracts the three allowed commands (if present) and validates their content against
 * the UneeQ response specification. Returns the resulting 'instructions' JSON object
 * that complies with the specification. If the parameter is empty or the content does
 * not comply, an empty object is returned.
 *
 * @param {string} response - the instructions string passed with a response from an NLP platform
 * @return {object} - JSON object that complies with the instructions specification
 */
let parseInstructions = (response) => {
    let instructions = {}

    try {
        let responseInstructions = JSON.parse(response.replace(/(\r\n|\n|\r)/gm, ''))
        /* The UneeQ specification supports three commands that can be passed in an instructions payload
         * in the answer field of a response:
         *
         * displayHtml: {string} passes through HTML content as a message for the client to display
         * extraHintPhrases: {array} hint phrases used to increase the accuracy of voice transcription
         * privateDataFilter: {boolean} instructs the UneeQ platform not to log the next user reply
         */

        /* If present, displayHtml must contain an 'html' field */
        if (responseInstructions.hasOwnProperty('displayHtml')) {
            // let displayHtml = JSON.parse(responseInstructions.displayHtml)
            let displayHtml = responseInstructions.displayHtml
            if (displayHtml.hasOwnProperty('html')) {
                instructions.displayHtml = displayHtml
                logger.debug(`Parsed a displayHtml payload: ${JSON.stringify(displayHtml)}`)
            } else {
                logger.warn("A displayHtml instruction was passed without the required 'html' field")
            }
        }

        /* If present, extraHintPhrases must contain a 'phrases' field, which must contain an array */
        if (responseInstructions.hasOwnProperty('extraHintPhrases')) {
            let extraHintPhrases = JSON.parse(responseInstructions.extraHintPhrases)
            if (extraHintPhrases.hasOwnProperty('phrases')) {
                if (Array.isArray(extraHintPhrases.phrases)) {
                    instructions.extraHintPhrases = extraHintPhrases
                    logger.debug(`Parsed a extraHintPhrases payload: ${JSON.stringify(extraHintPhrases)}`)
                } else {
                    logger.warn("The 'phrases' parameter in extraHintPhrases did not contain an array")
                }
            } else {
                logger.warn("An extraHintPhrases instruction was passed without the required 'phrases' field")
            }
        }

        /* If present, privateDataFilter must contain an 'enabled' field, which must contain a boolean */
        if (responseInstructions.hasOwnProperty('privateDataFilter')) {
            let privateDataFilter = JSON.parse(responseInstructions.privateDataFilter)
            if (privateDataFilter.hasOwnProperty('enabled')) {
                if (typeof privateDataFilter.enabled == 'boolean') {
                    instructions.privateDataFilter = privateDataFilter
                    logger.debug(`Parsed a privateDataFilter payload: ${JSON.stringify(privateDataFilter)}`)
                } else {
                    logger.warn("The 'enabled' parameter in privateDataFilter did not contain a boolean")
                }
            } else {
                logger.warn("A privateDataFilter instruction was passed without the required 'enabled' field")
            }
        }

        /* Pass through legacy instructions */
        if (responseInstructions.hasOwnProperty('expressionEvent')) {
            if (typeof responseInstructions.expressionEvent == 'object') {
                instructions.expressionEvent = responseInstructions.expressionEvent
                logger.debug(
                    `Parsed a legacy expressionEvent payload: ${JSON.stringify(responseInstructions.expressionEvent)}`
                )
            }
        }
        if (responseInstructions.hasOwnProperty('emotionalTone')) {
            if (typeof responseInstructions.emotionalTone == 'object') {
                instructions.emotionalTone = responseInstructions.emotionalTone
                logger.debug(
                    `Parsed a legacy emotionalTone payload: ${JSON.stringify(responseInstructions.emotionalTone)}`
                )
            }
        }

        if (Object.keys(instructions).length === 0 && !response == '') {
            throw new Error()
        }
    } catch (error) {
        logger.warn(`Could not parse instructions parameter: ${response}`)
        logger.warn(error)
    }

    return instructions
}

/**
 * Parses an answer string before it is passed in a response JSON. Checks for poorly formed
 * markup (since most NLP platforms allow free text in text response fields and perform no structural
 * validation), and conditionally applies SSML to the string if enforced
 *
 * @param {string} text - the answer string returned by the NLP service
 * @return {string} - parsed answer string ready to be passed in a response JSON
 */
let parseAnswer = async (text) => {
    let result = {}
    let parsedAnswer = text.replace(/(\r\n|\n|\r)/gm, ' ')

    try {
        let parser = new xml2js.Parser()
        result = await parser.parseStringPromise(`<test>${parsedAnswer}</test>`)

        switch (typeof result.test) {
            case 'string':
                /* The response was parsed and is of type string, so the response from the NLP platform contains
                 * no markup - if the SSML_ENFORCED variable is set, basic markup is applied to the string before returning */
                if (utils.parseBoolean(process.env.SSML_ENFORCED)) {
                    parsedAnswer = await createSSMLString(result.test, process.env.SSML_AUTO_BREAKS)
                }
                break

            case 'object':
            /* The response was parsed and is of type object, so the response from the NLP platform already
             * contains markup which is structurally valid. A future revision of this function will add
             * deeper validation of structure (such as the sequence of UneeQ behaviour tags and SSML tags)
             * to catch errors before going to UneeQ */
        }

        return parsedAnswer.replace(/"/g, "'")
    } catch (error) {
        logger.error(`The answer response contained structurally invalid markup: ${text}`)
        throw error
    }
}

/**
 * Adds basic SSML markup to a string. If the SSML_AMAZON_NEURAL and SSML_AMAZON_NEURAL_STYLE environment
 * variables are set, the SSML is in the Polly neural style. If the SSML_AUTO_BREAKS environment variable
 * is set, the array in SSML_AUTO_BREAKS_VALUES (mark, attribute, value) is used to generate SSML break tags
 *
 * @param {string} answer - dialog string to be marked up
 * @return {string} - answer string with SSML markup applied
 */
let createSSMLString = async (answer) => {
    let builder = new xml2js.Builder({
        headless: true,
        renderOpts: { pretty: false },
    })
    const entities = new Entities()
    let baseSSML = {}

    if (utils.parseBoolean(process.env.SSML_AUTO_BREAKS)) {
        try {
            let breaks = JSON.parse(process.env.SSML_AUTO_BREAKS_VALUES)

            for (i = 0; i < breaks.length; i++) {
                var breakString = `${breaks[i].mark} <break ${breaks[i].attribute}="${breaks[i].value}" />`
                var re = new RegExp(`\\${breaks[i].mark}`, 'g')
                answer = answer.replace(re, breakString)
            }
        } catch (error) {
            throw error
        }
    }

    if (utils.parseBoolean(process.env.SSML_AMAZON_NEURAL)) {
        let neuralSSML = {
            'amazon:domain': {
                $: { name: process.env.SSML_AMAZON_NEURAL_STYLE },
                _: answer,
            },
        }
        baseSSML = { speak: neuralSSML }
    } else {
        baseSSML = { speak: answer }
    }

    let ssmlString = entities.decode(builder.buildObject(baseSSML))
    return ssmlString
}

module.exports = {
    responseJSON,
    parseInstructions,
    parseAnswer,
}
