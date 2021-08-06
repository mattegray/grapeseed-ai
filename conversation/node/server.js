const http = require('http')
const app = require('./app')
const logger = require('./utils/logger')

const normalisePort = (val) => {
    const port = parseInt(val, 10)
    if (isNaN(port)) {
        return val
    }
    if (port >= 0) {
        return port
    }
    return false
}

const port = normalisePort(process.env.PORT || '5000')
app.set('port', port)

const errorHandler = (error) => {
    if (error.syscall !== 'listen') {
        throw error
    }
    const address = server.address()
    const bind = typeof address === 'string' ? `pipe ${address}` : `port ${port}`
    switch (error.code) {
        case 'EACCES':
            logger.error(` ${bind} requires elevated privileges.`)
            process.exit(1)
            break
        case 'EADDRINUSE':
            logger.error(` ${bind} is already in use.`)
            process.exit(1)
            break
        default:
            throw error
    }
}

const server = http.createServer(app)
server.on('error', errorHandler)
server.on('listening', () => {
    const address = server.address()
    const bind = typeof address === 'string' ? `pipe ${address}` : `port ${port}`
    logger.info(`Listening on ${bind}`)
})

server.listen(port)

module.exports = server
