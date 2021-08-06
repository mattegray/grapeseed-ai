require('dotenv').config();

const expect = require('chai').expect;
const token = require('../routes/token');

const nock = require('nock');
const jwt = require('jsonwebtoken');

let req = {
    query: {},
    body: {},
};

let res = {};

beforeEach( () => {
    res = {
        sendCalledWith: null,
        statusCode: null,
        status: (code) => { res.statusCode = code; },
        send: (arg) => { res.sendCalledWith = arg }
    };
    process.env.UNEEQ_WORKSPACE = 'workspace-id';
    process.env.UNEEQ_SECRET = 'secret';
});

describe('Token Route', () => {
    
    describe('getToken()', () => {

        it('Should respond with token', async () => {
            nock(process.env.UNEEQ_URI)
                .post('/api/v1/clients/access/tokens/')
                .reply(200, {token: 'my-token'});
            await token(req, res);
            expect(res.statusCode).to.equal(200);
            expect(res.sendCalledWith).to.equal(JSON.stringify({token: 'my-token'}));
        });

        it('Should respond with an error from clients/access/tokens/', async () => {
            const expectedJWT = jwt.sign({ sid: 'SESSION-ID', 'fm-workspace': process.env.UNEEQ_WORKSPACE }, process.env.UNEEQ_SECRET);
            nock(process.env.UNEEQ_URI)
                .post('/api/v1/clients/access/tokens/', expectedJWT)
                .reply(400, 'Error');
            await token(req, res);
            expect(res.statusCode).to.equal(500);
            expect(res.sendCalledWith).not.to.equal(null);
        });

    });

});
