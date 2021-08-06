const createError = require('http-errors')
const logger = require('../utils/logger')

const tokenServices = require('../services/token')

/**
 * This controller is bound to the API_ROUTE_TOKEN route defined in the
 * Express routes stack. The controller tries the 'getAccessToken' method of the
 * tokenServices service, and writes the resulting status and output to the Express
 * response object. Errors from the service are caught and terminated here
 * when the response object is written
 *
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 * @param {*} next - Express next object
 */
let processRequest = async (req, res, next) => {
    logger.info(`New token request to ${req.originalUrl}`)

    try {
        const tokenBody = await tokenServices.getAccessToken()
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.write(tokenBody)
        res.send()
        logger.info('SENT: 200 OK: token sent')
    } catch (error) {
        logger.error(`getAccessToken failed: ${error.stack}`)
        res.status(500).send(createError(500))
        logger.info('SENT: 500 Internal Server Error')
    }
}

module.exports = { processRequest }
