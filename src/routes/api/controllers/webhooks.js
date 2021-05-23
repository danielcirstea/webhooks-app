const axios = require('axios');
const webhookStorage = require('../../../session');

/**
 * 
 * @param {object} req - request object
 * @param {object} res - request object
 * @returns message if webhook registered
 */
const addWebhooks = (req, res) => {
  try {
    const { url, token } = req.body;

    webhookStorage.set({ url, token });
    return res.status(200).json({ message: 'Webhook successfully registered.' });
  } catch (error) {
    console.log('[ADD-WEBHOOKS-CONTROLLER][ERROR] Failed to register new webhook', error);
    return res.status(500).json(error);
  }
}

/**
 * 
 * @param {object} req - request object
 * @param {object} res - request object
 * @returns all webhook call results
 */
const callWebhooks = async (req, res) => {
  try {
    const { payload } = req.body;
    const webhooks = webhookStorage.get();

    let promises = [];
    let result = [];

    if (!webhooks.length) return res.status(200).json({ message: 'No webhooks are currently registered.' });

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

    const responses = await Promise.allSettled(promises);

    responses.forEach(response => {
      if (response.status === 'fulfilled') result.push({ status: 'success', webhook: response.value?.config?.url, data: response.value?.data });
      else {
        const webhook = response.reason?.config?.url;
        const error = response.reason?.message;

        result.push({ status: 'failed', webhook, error });
        console.log(`[CALL-WEBHOOKS-CONTROLLER][ERROR] Webhook ${webhook} call failed with error ${error}`);
      }
    });

    return res.status(200).json(result);
  } catch (error) {
    console.log('[CALL-WEBHOOKS-CONTROLLER][ERROR] Failed to call webhooks', error);
    return res.status(500).json(error);
  }
}


module.exports = {
  addWebhooks,
  callWebhooks
};
