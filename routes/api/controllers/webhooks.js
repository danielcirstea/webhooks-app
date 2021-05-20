const axios = require('axios');
const { MemoryStore } = require('../../../session');

const webhookStorage = new MemoryStore();

/**
 * 
 * @param {object} req - request object
 * @param {object} res - request object
 * @returns message if webhook registered
 */
const addWebhook = (req, res) => {
  try {
    const { url, token } = req.body;

    webhookStorage.set({ url, token });
    return res.status(200).json({ message: 'Webhook successfully registered.' });
  } catch (error) {
    console.log('[ADD-WEBHOOK-CONTROLLER][ERROR] Failed to register new webhook', error);
    return res.status(500).json(error);
  }
}

/**
 * 
 * @param {object} req - request object
 * @param {object} res - request object
 * @returns all webhook call results
 */
const callWebhooks = (req, res) => {
  try {
    const { payload } = req.body;
    const webhooks = webhookStorage.get();

    let promises = [];
    let result = [];

    for (const webhook of webhooks) {
      const request = axios({
        method: 'POST',
        url: webhook.url,
        data: {
          token: webhook.token,
          payload
        }
      });

      promises.push(request);
    }

    Promise.allSettled(promises)
      .then(responses => {
        responses.forEach(response => {
          if (response.status === 'fulfilled') result.push({ webhook: response.value?.config?.url, status: 'success', data: response.value?.data });
          else result.push({ webhook: response.reason?.config?.url, status: 'failed', error: response.reason?.message });
        });

        return res.status(200).json(result);
      });
  } catch (error) {
    console.log('[CALL-WEBHOOKS-CONTROLLER][ERROR] Failed to call webhooks', error);
    return res.status(500).json(error);
  }
}


module.exports = {
  addWebhook,
  callWebhooks
};
