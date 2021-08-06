const openai = require('./openai')
const dialogflow = require('./dialogflow/es')
const dialogflowCX = require('./dialogflow/cx')
const lex = require('./lex')
const watson = require('./watson')
const wolfram = require('./wolfram')
const directline = require('./directline')
const validation = require('../lib/validation')
const loaders = require('../../loaders')
const logger = require('../../utils/logger')

/* Create an array of objects, with the validation method, and query method for each route */
let rootAPIPath = process.env.API_ROUTE + process.env.API_ROUTE_NLP_STEM
let dialogflowAPIPath = rootAPIPath + process.env.API_ROUTE_NLP_DIALOGFLOW
let dialogflowCXAPIPath = rootAPIPath + process.env.API_ROUTE_NLP_DIALOGFLOWCX
let lexAPIPath = rootAPIPath + process.env.API_ROUTE_NLP_LEX
let watsonAPIPath = rootAPIPath + process.env.API_ROUTE_NLP_WATSON
let wolframAPIPath = rootAPIPath + process.env.API_ROUTE_NLP_WOLFRAM
let directlineAPIPath = rootAPIPath + process.env.API_ROUTE_NLP_DIRECTLINE
let openaiAPIPath = rootAPIPath + process.env.API_ROUTE_NLP_OPENAI

const routeModules = [
    { route: openaiAPIPath, configCheck: loaders.isValidOpenAIConfig, queryMethod: openai.query },
    { route: dialogflowAPIPath, configCheck: loaders.isValidDialogflowConfig, queryMethod: dialogflow.query },
    { route: dialogflowCXAPIPath, configCheck: loaders.isValidDialogflowCXConfig, queryMethod: dialogflowCX.query },
    { route: lexAPIPath, configCheck: loaders.isValidLexConfig, queryMethod: lex.query },
    { route: watsonAPIPath, configCheck: loaders.isValidWatsonConfig, queryMethod: watson.query },
    { route: wolframAPIPath, configCheck: loaders.isValidWolframConfig, queryMethod: wolfram.query },
    { route: directlineAPIPath, configCheck: loaders.isValidDirectlineConfig, queryMethod: directline.query },
]

/**
 * If the request body contains a request JSON that complies with the UneeQ request specification,
 * checks the environment variables for the route have been defined, then calls the query method
 * defined for the requested route
 *
 * @param {object} req - the Express request object
 * @return {string} Stringified JSON containing response
 */
let getNLPResponse = async (req) => {
    try {
        if (validation.isValidRequestJSON(req.body)) {
            logger.debug('Request JSON is valid')
            let i = routeModules.findIndex((x) => x.route === req.originalUrl)
            if (routeModules[i].configCheck()) {
                return await routeModules[i].queryMethod(req.body)
            }
        }
    } catch (error) {
        throw error
    }
}

module.exports = {
    getNLPResponse,
}
