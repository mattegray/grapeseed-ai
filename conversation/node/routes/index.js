// Collect and export all routes
const logger = require('../utils/logger')

module.exports = function (app) {
    let nlpRoutes = require('./api/nlp')
    let speakRoute = require('./api/speak')
    let tokenRoute = require('./api/token')
    let parrotRoute = require('./api/parrot')

    let nlpBaseURI = process.env.API_ROUTE + process.env.API_ROUTE_NLP_STEM
    let speakBaseURI = process.env.API_ROUTE + process.env.API_ROUTE_SPEAK
    let tokenBaseURI = process.env.API_ROUTE + process.env.API_ROUTE_TOKEN
    let parrotBaseURI = process.env.API_ROUTE + process.env.API_ROUTE_PARROT

    // Routes for NLP services
    app.use(nlpBaseURI, nlpRoutes)
    if (nlpRoutes.stack.length == 0) {
        logger.info('No NLP service routes were bound')
    } else {
        for (i = 0; i < nlpRoutes.stack.length; i++) {
            logger.info(`Bound ${nlpBaseURI}${nlpRoutes.stack[i].route.path}`)
        }
    }

    // Route for the unsolicited speak API service
    app.use(speakBaseURI, speakRoute)
    if (speakRoute.stack.length == 1) {
        logger.info(`Bound ${speakBaseURI}`)
    }

    // Route for the optional token request service
    app.use(tokenBaseURI, tokenRoute)
    if (tokenRoute.stack.length == 1) {
        logger.info(`Bound ${tokenBaseURI}`)
    }

    // Route for the optional parrot service
    app.use(parrotBaseURI, parrotRoute)
    if (parrotRoute.stack.length == 1) {
        logger.info(`Bound ${parrotBaseURI}`)
    }

    // Route for utilities including ping
    app.use('/', require('./utils'))
}
