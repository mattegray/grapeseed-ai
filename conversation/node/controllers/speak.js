const createError = require('http-errors')
const logger = require('../utils/logger')

const speak = require('../services/speak')

/**
 * This controller is bound to the API_ROUTE_SPEAK route defined in the
 * Express routes stack. The controller tries the 'push' method of the
 * speak service, and writes the resulting status and output to the Express
 * response object. Errors from the service are caught and terminated here
 * when the response object is written
 *
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 * @param {*} next - Express next object
 */
let processRequest = async (req, res, next) => {
    logger.info(`New unsolicited speak request to ${req.originalUrl}`)

    try {
        const responseBody = await speak.push(req.body)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.write(responseBody)
        res.send()
        logger.info('SENT: 200 OK: speak message pushed')
    } catch (error) {
        logger.error(`Unsolicited speak request failed: ${error.stack}`)
        res.status(500).send(createError(500))
        logger.info('SENT: 500 Internal Server Error')
    }
}

module.exports = { processRequest }
