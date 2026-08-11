/* eslint-disable no-console */
require('../shared/instrument');

const express = require('express');

const { seriesHandler } =
  process.env.APP_VERSION === 'v2' ? require('./handlers-v2') : require('./handlers-v1');

const app = express();

app.get('/api/series', (req, res) => {
  res.json(seriesHandler(req));
});

const port = Number(process.env.PORT || 4319);
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
