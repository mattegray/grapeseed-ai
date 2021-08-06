require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

const token = require('./routes/token');
const ping = require('./routes/ping');

// cors enabled only for local development / testing
app.use(cors());

// Add the URL routes for ping and token paths
app.use('/ping', ping);
app.use('/token', token);

module.exports = app;
