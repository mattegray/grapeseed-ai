const logger = require('../../utils/logger')
const loaders = require('../../loaders')
const axios = require('axios')
const jwt = require('jsonwebtoken')

/**
 * Calls the UneeQ API to get a single use access token, which can be passed with the initWithToken SDK method
 * to start a new conversation.
 *
 * @return {string} Stringified JSON containing the single use access token
 */
let getAccessToken = async () => {
    let uneeqTokenRequestURL = process.env.TOKEN_UNEEQ_URL + process.env.TOKEN_UNEEQ_ROUTE
    let uneeqJWTSecret = process.env.TOKEN_UNEEQ_JWTSECRET
    let uneeqPersonaID = process.env.TOKEN_UNEEQ_PERSONAID
    let customSid = 'your-session-id'
    let customData = { parameter: 'your data' }
    let tokenResponse = {}

    if (loaders.isValidTokenConfig()) {
        /* The specification for the UneeQ token API requires a payload containing three fields;
         *
         * 'sid' - User defined. Can be used to associate a conversation with session state in a different system. Can be a blank string
         * 'fm-custom-data' - User defined. Can be used for key:value pairs. Must be stringified JSON
         * 'fm-workspace' - Provided by UneeQ. The ID of the persona to be used for the conversation
         *
         * As per the specification for the request JSON, the data passed in the 'sid' and 'fm-custom-data'
         * fields during the token request is returned in the 'sid' and 'fm-custom-data' fields with each
         * request during the conversation. The token request payload is signed using a shared secret
         * issued by UneeQ. The token request specification also requires a 'workspace' header which
         * contains the ID of the persona to be used for the conversation */
        let body = jwt.sign(
            { sid: customSid, 'fm-workspace': uneeqPersonaID, 'fm-custom-data': customData },
            uneeqJWTSecret
        )
        let headers = { headers: { 'content-type': 'application/jwt', workspace: uneeqPersonaID } }

        /* The async/await post call is wrapped in a retry loop here for resilience to 500 errors from the API */
        let attempt = 0
        let retries = 5
        while (attempt <= retries) {
            try {
                tokenResponse = await axios.post(uneeqTokenRequestURL, body, headers)
                logger.info(`Got token response after ${attempt} retries`)
                return JSON.stringify(tokenResponse.data)
            } catch (error) {
                if (attempt > retries) {
                    // Errors are caught in the controller
                    throw error
                } else {
                    attempt++
                }
            }
        }
    }
}

module.exports = { getAccessToken }
