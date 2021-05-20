const express = require('express');
const router = express.Router();

const controllers = require('./controllers');

router.post('/webhooks', controllers.webhooks.addWebhook);
router.post('/webhooks/test', controllers.webhooks.callWebhooks);

module.exports = router;
