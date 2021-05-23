const express = require('express');
const router = express.Router();
const validate = require('express-jsonschema').validate;

const controllers = require('./controllers');
const { WebhookSchema, PayloadSchema } = require('./schemas');
const schemaValidation = require('./middlewares/schemaValidation');

router.post('/webhooks', validate({ body: WebhookSchema }), controllers.webhooks.addWebhooks);
router.post('/webhooks/test', validate({ body: PayloadSchema }), controllers.webhooks.callWebhooks);

router.use(schemaValidation);

module.exports = router;
