const express = require('express')
const logger = require('../../utils/logger')

const router = express.Router()

// Create a simple healthcheck/ping route
router.get('/ping', (req, res, next) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html')
    res.write('Alive')
    res.send()
    logger.info('SENT: 200 OK: ping response')
})

module.exports = router
