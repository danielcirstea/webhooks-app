const axios = require('axios');
const { MemoryStore } = require('../../../session');

const webhookStorage = new MemoryStore();

const addWebhook = (req, res) => {
  try {
    const { url, token } = req.body;

    webhookStorage.set(url, token);
    return res.status(200).json({ message: 'Webhook successfully registered.'});
  } catch(error) {
    console.log('[API-WEBHOOKS] Failed to register new webhook', error);
    return res.status(500).json({ message: error });
  }
}

module.exports = {
  addWebhook
}
