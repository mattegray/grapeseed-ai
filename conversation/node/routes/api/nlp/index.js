const express = require('express')
const createError = require('http-errors')
const orchestration = require('../../../controllers/nlp')
const logger = require('../../../utils/logger')
const utils = require('../../../utils')

const router = express.Router()

// Generate 405 message for non-POST requests to the /api routes
const methodNotAllowed = (req, res, next) => {
    res.status(405).send(createError(405))
    logger.info(`SENT: 405 Method Not Allowed: ${req.method} request to ${req.originalUrl}`)
}

/* Conditionally construct the /api/nlp routes, if the ENABLED variable for each platform is true
 * This is preferring that requests to routes that have not been configured result in a 404 and not an application error
 * POST requests route to the controller, all other methods raise 405 error */
const nlpRoutes = [
    { route: process.env.API_ROUTE_NLP_DIALOGFLOW, enabled: utils.parseBoolean(process.env.DIALOGFLOW_ENABLED) },
    { route: process.env.API_ROUTE_NLP_DIALOGFLOWCX, enabled: utils.parseBoolean(process.env.DIALOGFLOWCX_ENABLED) },
    { route: process.env.API_ROUTE_NLP_LEX, enabled: utils.parseBoolean(process.env.LEX_ENABLED) },
    { route: process.env.API_ROUTE_NLP_WATSON, enabled: utils.parseBoolean(process.env.WATSON_ENABLED) },
    { route: process.env.API_ROUTE_NLP_WOLFRAM, enabled: utils.parseBoolean(process.env.WOLFRAM_ENABLED) },
    { route: process.env.API_ROUTE_NLP_DIRECTLINE, enabled: utils.parseBoolean(process.env.DIRECTLINE_ENABLED) },
]

for (i = 0; i < nlpRoutes.length; i++) {
    if (nlpRoutes[i].enabled) {
        router.route(nlpRoutes[i].route).post(orchestration.processRequest).all(methodNotAllowed)
    }
}

module.exports = router
