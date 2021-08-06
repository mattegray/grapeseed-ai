const request = require('supertest')
const app = require('../server')
const utils = require('../utils')
const logger = require('../utils/logger')
const validation = require('./lib/validation')

// Set up the request JSON payloads for testing
// Create a request JSON with the fields from the UneeQ request specification
// Deep copy the UneeQ JSON (stringify/parse) to welcome and question payloads
let uneeqRequestJSON = {
    sid: 'session-id',
    'fm-custom-data': '{"custom-data":"passed with token request"}',
    'fm-question': '',
    'fm-avatar': '',
    'fm-conversation': '',
}
let welcomeRequestJSON = JSON.parse(JSON.stringify(uneeqRequestJSON))
welcomeRequestJSON['fm-avatar'] = '{"type":"WELCOME","avatarSessionId":"123456789"}'
let questionRequestJSON = JSON.parse(JSON.stringify(uneeqRequestJSON))
questionRequestJSON['fm-question'] = 'Hello'
questionRequestJSON['fm-avatar'] = '{"type":"QUESTION","avatarSessionId":"123456789"}'

// Close out at the end of the test run
afterAll((done) => {
    app.close()
    done()
})

// Test the ping/heartbeat route
describe('Ping', () => {
    it("Should respond with status 200 and text 'Alive'", async () => {
        let res = await request(app).get('/ping')
        expect(res.text).toEqual('Alive')
        expect(res.statusCode).toEqual(200)
    })
})

// Test the token route, if enabled
if (utils.parseBoolean(process.env.TOKEN_ROUTE_ENABLED)) {
    describe('Token service end-to-end', () => {
        it('Should respond with status 200 and a JSON payload containing a single use token', async () => {
            res = await request(app).get(process.env.API_ROUTE + process.env.API_ROUTE_TOKEN)
            expect(res.statusCode).toBe(200)
            expect(validation.isValidTokenJSON(res)).toBe(true)
        })
    })
}

// End to end test - iteratively run all of the configured POST routes - WELCOME and QUESTION
let nlpRouteTest = async (name, route) => {
    let res = {}

    describe(`NLP services end-to-end: ${name} 'WELCOME' and 'QUESTION' requests with platform session ID`, () => {
        it('Should respond with status 200 and response JSON payload compliant with UneeQ specification', async () => {
            if (utils.parseBoolean(process.env.AUTHORIZATION_REQUIRED)) {
                res = await request(app)
                    .post(process.env.API_ROUTE + process.env.API_ROUTE_NLP_STEM + route)
                    .set('Authorization', process.env.AUTHORIZATION_HEADER)
                    .send(welcomeRequestJSON)

                questionRequestJSON['fm-conversation'] = JSON.parse(res.text).conversationPayload
                res = await request(app)
                    .post(process.env.API_ROUTE + process.env.API_ROUTE_NLP_STEM + route)
                    .set('Authorization', process.env.AUTHORIZATION_HEADER)
                    .send(questionRequestJSON)
            } else {
                res = await request(app)
                    .post(process.env.API_ROUTE + process.env.API_ROUTE_NLP_STEM + route)
                    .send(welcomeRequestJSON)

                questionRequestJSON['fm-conversation'] = JSON.parse(res.text).conversationPayload
                res = await request(app)
                    .post(process.env.API_ROUTE + process.env.API_ROUTE_NLP_STEM + route)
                    .send(questionRequestJSON)
            }
            expect(res.statusCode).toBe(200)
            expect(validation.isValidResponseJSON(res)).toBe(true)
        })
    })
}

let testRoutes = []
if (utils.parseBoolean(process.env.OPENAI_ENABLED)) {
    testRoutes.push(['OpenAI', process.env.API_ROUTE_NLP_OPENAI])
}
if (utils.parseBoolean(process.env.DIALOGFLOW_ENABLED)) {
    testRoutes.push(['Dialogflow', process.env.API_ROUTE_NLP_DIALOGFLOW])
}
if (utils.parseBoolean(process.env.DIALOGFLOWCX_ENABLED)) {
    testRoutes.push(['Dialogflow CX', process.env.API_ROUTE_NLP_DIALOGFLOWCX])
}
if (utils.parseBoolean(process.env.WATSON_ENABLED)) {
    testRoutes.push(['Watson', process.env.API_ROUTE_NLP_WATSON])
}
if (utils.parseBoolean(process.env.LEX_ENABLED)) {
    testRoutes.push(['Lex', process.env.API_ROUTE_NLP_LEX])
}
if (utils.parseBoolean(process.env.WOLFRAM_ENABLED)) {
    testRoutes.push(['Wolfram', process.env.API_ROUTE_NLP_WOLFRAM])
}

for (var i = 0; i < testRoutes.length; i++) {
    nlpRouteTest(testRoutes[i][0], testRoutes[i][1])
}
