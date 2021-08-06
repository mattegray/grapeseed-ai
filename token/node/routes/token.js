var rp = require('request-promise');
const jwt = require('jsonwebtoken');

let getToken = async (req, res) => {

    // Environment variables loaded in from .env
    const uneeqUri = process.env.UNEEQ_URI;
    const uneeqWorkspace = process.env.UNEEQ_WORKSPACE;
    const uneeqSecret = process.env.UNEEQ_SECRET;

    // The custom data to be associated with the session and available when asking a question to conversation service
    let customData = { customDataExample: 'Custom data example.' };

    try {

        const request = {
            method: 'POST',
            uri: uneeqUri + '/api/v1/clients/access/tokens/',
            body: jwt.sign( /* The body must be signed as JWT with customers secret */
                {
                    sid: 'SESSION-ID',
                    'fm-workspace': uneeqWorkspace,
                    'fm-custom-data': JSON.stringify(customData)
                },
                uneeqSecret
            ),
            headers:{
                "content-type":"application/jwt",
                "workspace": uneeqWorkspace
            }
        };

        // Make the request and return the token
        const getTokenResponse = await rp(request);
        res.status(200);
        res.send(getTokenResponse);

    } catch(err) {

        // Log and return errors
        console.error(err);
        res.status(500);
        res.send(err);

    }

};

module.exports = getToken;
