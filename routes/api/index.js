const express = require('express');
const api = express.Router();

const controllers = require('./controllers');

api.post('/webhooks', controllers.webhooks.addWebhook);

module.exports = api;
