const uuid = require('uuid')
const utils = require('../utils')
const logger = require('../utils/logger')

/* As all the configuration of routes and connection details for the various services
 * to environment variables, the purpose of the loader functions is to catch errors with
 * missing environment variables before the services are called. The initialiseRoutePaths
 * loader function will additionally substitute default values for missing route paths if
 * the corresponding service is enabled so that it can still start */

function initialiseRoutePaths() {
    let isDialogflowEnabled = utils.parseBoolean(process.env.DIALOGFLOW_ENABLED)
    let isDialogflowCXEnabled = utils.parseBoolean(process.env.DIALOGFLOWCX_ENABLED)
    let isWatsonEnabled = utils.parseBoolean(process.env.WATSON_ENABLED)
    let isLexEnabled = utils.parseBoolean(process.env.LEX_ENABLED)
    let isWolframEnabled = utils.parseBoolean(process.env.WOLFRAM_ENABLED)
    let isDirectlineEnabled = utils.parseBoolean(process.env.DIRECTLINE_ENABLED)
    let isOpenAIEnabled = utils.parseBoolean(process.env.OPENAI_ENABLED)

    let isTokenEnabled = utils.parseBoolean(process.env.TOKEN_ROUTE_ENABLED)
    let isParrotEnabled = utils.parseBoolean(process.env.PARROT_ROUTE_ENABLED)
    let isSpeakEnabled = utils.parseBoolean(process.env.SPEAK_ROUTE_ENABLED)

    // If route stem and paths have not been set in env, subtitute defaults
    if (!process.env.API_ROUTE) {
        logger.info('No API base route configured - using default /api/v1')
        process.env.API_ROUTE = '/api/v1'
    }
    if (!process.env.API_ROUTE_NLP_STEM) {
        logger.info('No API NLP stem configured - using default /nlp')
        process.env.API_ROUTE_NLP_STEM = '/nlp'
    }
    if (isDialogflowEnabled && !process.env.API_ROUTE_NLP_DIALOGFLOW) {
        logger.info('No Dialogflow route configured - using default /dialogflow')
        process.env.API_ROUTE_NLP_DIALOGFLOW = '/dialogflow'
    }
    if (isDialogflowCXEnabled && !process.env.API_ROUTE_NLP_DIALOGFLOWCX) {
        logger.info('No Dialogflow CX route configured - using default /dialogflowcx')
        process.env.API_ROUTE_NLP_DIALOGFLOWCX = '/dialogflowcx'
    }
    if (isLexEnabled && !process.env.API_ROUTE_NLP_LEX) {
        logger.info('No Lex route configured - using default /lex')
        process.env.API_ROUTE_NLP_LEX = '/lex'
    }
    if (isWatsonEnabled && !process.env.API_ROUTE_NLP_WATSON) {
        logger.info('No Watson route configured - using default /watson')
        process.env.API_ROUTE_NLP_WATSON = '/watson'
    }
    if (isWolframEnabled && !process.env.API_ROUTE_NLP_WOLFRAM) {
        logger.info('No Wolfram route configured - using default /wolfram')
        process.env.API_ROUTE_NLP_WOLFRAM = '/wolfram'
    }
    if (isDirectlineEnabled && !process.env.API_ROUTE_NLP_DIRECTLINE) {
        logger.info('No Directline route configured - using default /directline')
        process.env.API_ROUTE_NLP_DIRECTLINE = '/directline'
    }
    if (isOpenAIEnabled && !process.env.API_ROUTE_NLP_OPENAI) {
        logger.info('No OpenAI route configured - using default /openai')
        process.env.API_ROUTE_NLP_OPENAI = '/openai'
    }

    if (utils.parseBoolean(process.env.AUTHORIZATION_REQUIRED)) {
        if (!process.env.AUTHORIZATION_HEADER) {
            // execution lands here if authorisation required is true, but no key has been set
            // generate a key for this session and log so server can start and requests can be updated
            let randKey = uuid.v4()
            process.env.AUTHORIZATION_HEADER = randKey
            logger.warn(
                `Authorization required but no key set - session key will be ${process.env.AUTHORIZATION_HEADER}`
            )
            logger.warn('Update the AUTHORIZATION_HEADER environment variable to a fixed key to stop this warning')
        }
    } else {
        process.env.AUTHORIZATION_HEADER = ''
    }

    if (isTokenEnabled && !process.env.API_ROUTE_TOKEN) {
        logger.info('No token route configured - using default /token')
        process.env.API_ROUTE_TOKEN = '/token'
    }

    if (isParrotEnabled && !process.env.API_ROUTE_PARROT) {
        logger.info('No parrot route configured - using default /parrot')
        process.env.API_ROUTE_PARROT = '/parrot'
    }

    if (isSpeakEnabled && !process.env.API_ROUTE_SPEAK) {
        logger.info('No speak route configured - using default /speak')
        process.env.API_ROUTE_SPEAK = '/speak'
    }
}

function initialiseEnvironmentVars() {
    /* The Dialogflow and Dialogflow CX credential variables contain a stringified JSON - the implicit conversion
     * to string is different in some container environments, so this routine simply removes the enclosing quotes
     * in the environment file so the objects will parse correctly irrespective of environment
     */
    if (utils.parseBoolean(process.env.DIALOGFLOW_ENABLED)) {
        process.env.DIALOGFLOW_CONFIG_CREDENTIALS = process.env.DIALOGFLOW_CONFIG_CREDENTIALS.replace(/'/g, '')
    }
    if (utils.parseBoolean(process.env.DIALOGFLOWCX_ENABLED)) {
        process.env.DIALOGFLOWCX_CONFIG_CREDENTIALS = process.env.DIALOGFLOWCX_CONFIG_CREDENTIALS.replace(/'/g, '')
    }
    if (utils.parseBoolean(process.env.SSML_AUTO_BREAKS)) {
        process.env.SSML_AUTO_BREAKS_VALUES = process.env.SSML_AUTO_BREAKS_VALUES.replace(/'/g, '')
    }
}

function isValidDialogflowConfig() {
    try {
        if (utils.parseBoolean(process.env.DIALOGFLOW_ENABLED)) {
            if (!process.env.DIALOGFLOW_CONFIG_PROJECTID) {
                throw new Error('No Dialogflow project ID configured')
            }
            if (!process.env.DIALOGFLOW_CONFIG_PROJECTLANGUAGE) {
                throw new Error('No Dialogflow project language configured')
            }
            if (utils.parseBoolean(process.env.DIALOGFLOW_CONFIG_USEKNOWLEDGEBASE)) {
                if (!process.env.DIALOGFLOW_CONFIG_PROJECTKNOWLEDGEBASE) {
                    throw new Error('No Dialogflow project knowledge base configured')
                }
            }
            if (!process.env.DIALOGFLOW_CONFIG_CREDENTIALS) {
                throw new Error('No Dialogflow project credentials configured')
            }
        } else {
            throw new Error('Dialogflow not enabled')
        }
        return true
    } catch (error) {
        throw error
    }
}

function isValidDialogflowCXConfig() {
    try {
        if (utils.parseBoolean(process.env.DIALOGFLOWCX_ENABLED)) {
            if (!process.env.DIALOGFLOWCX_CONFIG_PROJECTID) {
                throw new Error('No Dialogflow CX project ID configured')
            }
            if (!process.env.DIALOGFLOWCX_CONFIG_PROJECTLANGUAGE) {
                throw new Error('No Dialogflow CX project language configured')
            }
            if (!process.env.DIALOGFLOWCX_CONFIG_AGENT) {
                throw new Error('No Dialogflow CX agent ID configured')
            }
            if (!process.env.DIALOGFLOWCX_CONFIG_LOCATION) {
                throw new Error('No Dialogflow CX project location configured')
            }
            if (!process.env.DIALOGFLOWCX_CONFIG_ENVIRONMENT) {
                throw new Error('No Dialogflow CX environment configured')
            }
            if (!process.env.DIALOGFLOWCX_CONFIG_CREDENTIALS) {
                throw new Error('No Dialogflow CX project credentials configured')
            }
        } else {
            throw new Error('Dialogflow CX not enabled')
        }
        return true
    } catch (error) {
        throw error
    }
}

function isValidLexConfig() {
    try {
        if (utils.parseBoolean(process.env.LEX_ENABLED)) {
            if (!process.env.LEX_CONFIG_AWSREGION) {
                throw new Error('No Lex AWS region configured')
            }
            if (!process.env.LEX_CONFIG_ACCESSKEYID) {
                throw new Error('No Lex access key configured')
            }
            if (!process.env.LEX_CONFIG_SECRETACCESSKEY) {
                throw new Error('No Lex secret access key configured')
            }
            if (!process.env.LEX_CONFIG_BOTALIAS) {
                throw new Error('No Lex bot alias configured')
            }
            if (!process.env.LEX_CONFIG_BOTNAME) {
                throw new Error('No Lex bot name configured')
            }
            if (!process.env.LEX_CONFIG_WELCOMEINTENT) {
                throw new Error('No Lex welcome intent configured')
            }
        } else {
            throw new Error('Lex not enabled')
        }
        return true
    } catch (error) {
        throw error
    }
}

function isValidWatsonConfig() {
    try {
        if (utils.parseBoolean(process.env.WATSON_ENABLED)) {
            if (!process.env.WATSON_CONFIG_IAMAPIKEY) {
                throw new Error('No Watson IAM key configured')
            }
            if (!process.env.WATSON_CONFIG_ASSISTANTID) {
                throw new Error('No Watson Assistant ID configured')
            }
            if (!process.env.WATSON_CONFIG_ENDPOINTURI) {
                throw new Error('No Watson endpoint URI configured')
            }
        } else {
            throw new Error('Watson not enabled')
        }
        return true
    } catch (error) {
        throw error
    }
}

function isValidWolframConfig() {
    try {
        if (utils.parseBoolean(process.env.WOLFRAM_ENABLED)) {
            if (!process.env.WOLFRAM_CONFIG_APPID) {
                throw new Error('No Wolfram app ID configured')
            }
            if (!process.env.WOLFRAM_CONFIG_APIBASEURL) {
                throw new Error('No Wolfram API URL configured')
            }
            if (!process.env.WOLFRAM_CONFIG_APIROUTE) {
                throw new Error('No Wolfram API route configured')
            }
            if (!process.env.WOLFRAM_CONFIG_QUERYPARAM) {
                throw new Error('No Wolfram query parameter name configured')
            }
            if (!process.env.WOLFRAM_CONFIG_SESSIONPARAM) {
                throw new Error('No Wolfram session parameter name configured')
            }
            if (!process.env.WOLFRAM_CONFIG_GREETING) {
                throw new Error('No Wolfram greeting configured')
            }
            if (!process.env.WOLFRAM_CONFIG_NOTFOUNDMSG) {
                throw new Error('No Wolfram not found message configured')
            }
        } else {
            throw new Error('Wolfram not enabled')
        }
        return true
    } catch (error) {
        throw error
    }
}

function isValidDirectlineConfig() {
    try {
        if (utils.parseBoolean(process.env.DIRECTLINE_ENABLED)) {
            if (!process.env.DIRECTLINE_CONFIG_SECRET) {
                throw new Error('No Directline secret configured')
            }
            if (!process.env.DIRECTLINE_CONFIG_SCENARIO) {
                throw new Error('No Directline scenario configured')
            }
            if (!process.env.DIRECTLINE_CONFIG_LOCALE) {
                throw new Error('No Directline locale configured')
            }
        } else {
            throw new Error('Directline not enabled')
        }
        return true
    } catch (error) {
        throw error
    }
}

function isValidOpenAIConfig() {
    try {
        if (utils.parseBoolean(process.env.OPENAI_ENABLED)) {
            if (!process.env.OPENAI_API_KEY) {
                throw new Error('No OpenAI key configured')
            }
        } else {
            throw new Error('OpenAI not enabled')
        }
        return true
    } catch (error) {
        throw error
    }
}

function isValidTokenConfig() {
    try {
        if (utils.parseBoolean(process.env.TOKEN_ROUTE_ENABLED)) {
            if (!process.env.TOKEN_UNEEQ_URL) {
                throw new Error('No UneeQ API URL configured')
            }
            if (!process.env.TOKEN_UNEEQ_ROUTE) {
                throw new Error('No UneeQ token route configured')
            }
            if (!process.env.TOKEN_UNEEQ_JWTSECRET) {
                throw new Error('No token JWT secret configured')
            }
            if (!process.env.TOKEN_UNEEQ_PERSONAID) {
                throw new Error('No token workspace ID configured')
            }
        } else {
            throw new Error('Token not configured')
        }
        return true
    } catch (error) {
        throw error
    }
}

function isValidSpeakConfig() {
    try {
        if (utils.parseBoolean(process.env.SPEAK_ROUTE_ENABLED)) {
            if (!process.env.SPEAK_UNEEQ_URL) {
                throw new Error('No UneeQ API URL configured')
            }
            if (!process.env.SPEAK_UNEEQ_ROUTE) {
                throw new Error('No UneeQ speak route configured')
            }
            if (!process.env.SPEAK_UNEEQ_JWTSECRET) {
                throw new Error('No speak JWT secret configured')
            }
        } else {
            throw new Error('Speak route not configured')
        }
        return true
    } catch (error) {
        throw error
    }
}

module.exports = {
    initialiseRoutePaths,
    initialiseEnvironmentVars,
    isValidDialogflowConfig,
    isValidDialogflowCXConfig,
    isValidLexConfig,
    isValidWatsonConfig,
    isValidWolframConfig,
    isValidDirectlineConfig,
    isValidOpenAIConfig,
    isValidTokenConfig,
    isValidSpeakConfig,
}
