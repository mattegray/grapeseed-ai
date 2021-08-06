const express = require('express')
const createError = require('http-errors')
const orchestration = require('../../../controllers/parrot')
const logger = require('../../../utils/logger')
const utils = require('../../../utils')

const router = express.Router()

// Generate 405 message for non-POST requests to the /parrot routes
const methodNotAllowed = (req, res, next) => {
    res.status(405).send(createError(405))
    logger.info(`SENT: 405 Method Not Allowed: ${req.method} request to ${req.originalUrl}`)
}

/* Conditionally construct the parrot route, if the PARROT_ROUTE_ENABLED environment variable is true
 * This is preferring that requests to routes that have not been enabled result in a 404 and not an application error
 * POST requests route to the controller, all other methods raise 405 error */
if (utils.parseBoolean(process.env.PARROT_ROUTE_ENABLED)) {
    router.route('/').post(orchestration.processRequest).all(methodNotAllowed)
}

module.exports = router
