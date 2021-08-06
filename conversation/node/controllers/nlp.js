const createError = require('http-errors')
const nlpServices = require('../services/nlp')
const utils = require('../utils')
const logger = require('../utils/logger')

/**
 * This controller is bound to all the NLP routes defined in the
 * Express routes stack. This method performs an authorization header check
 * if enabled in the environment variables, then tries the 'getNLPResponse'
 * method of the NLP service handler, which in turn calls the NLP service
 * for that route, and writes the resulting status and output to the Express
 * response object. Errors from the service are caught and terminated here
 * when the response object is written
 *
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 * @param {*} next - Express next object
 */
let processRequest = async (req, res, next) => {
    let authRequired = utils.parseBoolean(process.env.AUTHORIZATION_REQUIRED)
    let authHeader = req.headers.authorization
    let authKey = process.env.AUTHORIZATION_HEADER

    logger.info(`New POST request to ${req.originalUrl}`)

    if (!authRequired || authHeader === authKey) {
        if (Object.keys(req.body).length === 0) {
            res.status(400).send(createError(400))
            logger.info('SENT: 400 Bad Request: POST request body was empty')
        } else {
            logger.debug(`POST request body: ${JSON.stringify(req.body)}`)

            try {
                const responseBody = await nlpServices.getNLPResponse(req)
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.write(responseBody)
                res.send()
                logger.info('SENT: 200 OK: Response JSON sent')
            } catch (error) {
                logger.error(`getNLPResponse failed: ${error.stack}`)
                res.status(500).send(createError(500))
                logger.info('SENT: 500 Internal Server Error')
            }
        }
    } else {
        res.status(401).send(createError(401))
        logger.info('SENT: 401 Unauthorised: Incorrect authorization header value')
    }
}

module.exports = {
    processRequest,
}
