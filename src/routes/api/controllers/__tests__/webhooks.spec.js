const axios = require('axios');
const { addWebhooks, callWebhooks } = require('../webhooks');
const webhookStorage = require('../../../../session');

jest.mock('axios', () => params => {
    if (params.url === 'https://www.example.com') {
        return Promise.resolve({ data: { foo: 'bar' }, config: { url: params.url } });
    }
    if (params.url === 'https://www.example2.com') {
        return Promise.resolve({ data: { baz: 'roo' }, config: { url: params.url } });
    }
    return Promise.reject({ message: 'api call failed', config: { url: params.url } });
});

jest.mock('../../../../session', () => ({
    storage: [],
    set: jest.fn().mockImplementation(function (data) { this.storage.push(data) }),
    get: jest.fn().mockImplementation(function () { return this.storage }),
}));

const mockRequest = () => {
    const req = {};
    return req;
};

const mockResponse = () => ({
    status: jest.fn().mockImplementation(function(status) {
        this.status = status;
        return this;
    }),
    json: jest.fn().mockImplementation(function(json) {
        this.json = json;
        return this;
    })
});

describe('Webhooks Controller', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});

        webhookStorage.storage = [];
    });

    describe('addWebhooks() ::', () => {
        it('should register a webhook and return a success message', () => {
            const req = mockRequest();
            const res = mockResponse();

            const storageSet = jest.spyOn(webhookStorage, 'set');

            req.body = {
                url: 'https://www.example.com',
                token: 'foo'
            };

            addWebhooks(req, res);

            expect(storageSet).toHaveBeenCalledWith(req.body);
            expect(res.status).toEqual(200);
            expect(res.json).toEqual({ message: 'Webhook successfully registered.' })
        });

        it('should return an error if there is no request body or a bad request', () => {
            const req = mockRequest();
            const res = mockResponse();

            const storageSet = jest.spyOn(webhookStorage, 'set');

            addWebhooks(req, res);

            expect(storageSet).not.toHaveBeenCalled();
            expect(res.status).toEqual(500);
            expect(res.json).toEqual(new TypeError(`Cannot destructure property 'url' of 'req.body' as it is undefined.`));
        });
    });

    describe('callWebhooks() ::', () => {
        it('should call all webhooks and return data without errors', async () => {
            const req = mockRequest();
            const res = mockResponse();

            req.body = {
                payload: ["item_1", "item_2"]
            };

            const input = [
                {
                    url: 'https://www.example.com',
                    token: '123'
                },
                {
                    url: 'https://www.example2.com',
                    token: '124'
                }
            ];

            const response = [
                {
                    status: 'success',
                    webhook: 'https://www.example.com',
                    data: { foo: 'bar' }
                },
                {
                    status: 'success',
                    webhook: 'https://www.example2.com',
                    data: { baz: 'roo' }
                }
            ]

            webhookStorage.set(input[0]);
            webhookStorage.set(input[1]);

            await callWebhooks(req, res);

            expect(webhookStorage.get()).toEqual(input);
            expect(res.status).toEqual(200);
            expect(res.json).toEqual(response);
        });

        it('should call all webhooks and return data with errors as well', async () => {
            const req = mockRequest();
            const res = mockResponse();

            req.body = {
                payload: ["item_1", "item_2"]
            };

            const input = [
                {
                    url: 'https://www.example.com',
                    token: '124'
                },
                {
                    url: 'https://www.example3.com',
                    token: '121'
                },
            ];

            const response = [
                {
                    status: 'success',
                    webhook: 'https://www.example.com',
                    data: { foo: 'bar' }
                },
                {
                    status: 'failed',
                    webhook: 'https://www.example3.com',
                    error: 'api call failed'
                }
            ]

            webhookStorage.set(input[0]);
            webhookStorage.set(input[1]);

            await callWebhooks(req, res);

            expect(webhookStorage.get()).toEqual(input);
            expect(res.status).toEqual(200);
            expect(res.json).toEqual(response);
        });

        it('should return custom message if no webhooks were previously registered', async () => {
            const req = mockRequest();
            const res = mockResponse();

            req.body = {
                payload: ["item_1", "item_2"]
            };

            await callWebhooks(req, res);

            expect(webhookStorage.get()).toEqual([]);
            expect(res.status).toEqual(200);
            expect(res.json).toEqual({ message: 'No webhooks are currently registered.' });

        });

        it('should return an error if there is no request body or a bad request', () => {
            const req = mockRequest();
            const res = mockResponse();

            addWebhooks(req, res);

            expect(res.status).toEqual(500);
            expect(res.json).toEqual(new TypeError(`Cannot destructure property 'url' of 'req.body' as it is undefined.`));
        });
    })
});