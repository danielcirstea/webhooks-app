const WebhookSchema = {
    type: 'object',
    properties: {
        url: {
            type: 'string',
            required: true
        },
        token: {
            type: 'string',
            required: true
        }
    }
};

const PayloadSchema = {
    type: 'object',
    properties: {
        payload: {
            required: true
        }
    }
};

module.exports = {
    WebhookSchema,
    PayloadSchema
};