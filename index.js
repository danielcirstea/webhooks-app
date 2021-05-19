const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const app = express();
const config = require('./config')();
const api = require('./routes/api');
const packageJson = require('./package.json');

app.use(helmet());
app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());

app.use('/api', api);
app.use('*', (_req, res) => res.status(200).json({ name: packageJson.name, version: packageJson.version, status: 'online' }));

app.listen(config.port, () => console.log(`App started on port ${config.port}.`));
