const express = require('express')
const createError = require('http-errors')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const loaders = require('./loaders')
const logger = require('./utils/logger')

const app = express()

// Middleware security and parsing
app.use(helmet())
app.use(xss())
app.use(express.json({ limit: '10kb' }))
app.use(cors())

// Initialise paths and create routes
loaders.initialiseRoutePaths()
loaders.initialiseEnvironmentVars()
require('./routes')(app)

// Catch all requests not sent to the attached routes and send 404 response
app.use(function (req, res, next) {
    res.status(404).send(createError(404))
    logger.info(`SENT: 404 Not Found: ${req.originalUrl}`)
})

// Express error handler
app.use((err, req, res, next) => {
    const elements = [err.status, createError(err.status), err.message]
    res.status(err.status).send(createError(err.status))
    logger.info(`SENT: ${elements.join(' ')}`)
})

module.exports = app
