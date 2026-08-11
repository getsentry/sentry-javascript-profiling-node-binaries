/* eslint-disable no-console */
// Sentry instrumentation for the demo servers. Must be required before any
// other module (notably express) so auto-instrumentation can hook require.
//
// Instead of sending envelopes to Sentry, profile envelope items are captured
// to a local JSONL sink file (SINK_FILE env var) and the transport discards
// everything — the ingestion pipeline is bypassed entirely, as the raw profile
// produced by the modified native binding is what the demo inspects.
const fs = require('node:fs');

const Sentry = require('@sentry/node');
const { createTransport } = require('@sentry/core');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

const sinkFile = process.env.SINK_FILE;

if (!sinkFile) {
  console.error('SINK_FILE env var is required');
  process.exit(1);
}

function discardTransport(options) {
  return createTransport(options, async () => ({ statusCode: 200 }));
}

Sentry.init({
  dsn: 'https://public@demo-sink.invalid/1',
  transport: discardTransport,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

const client = Sentry.getClient();

client.on('beforeEnvelope', envelope => {
  for (const [itemHeader, payload] of envelope[1]) {
    if (itemHeader.type === 'profile' || itemHeader.type === 'profile_chunk') {
      fs.appendFileSync(sinkFile, `${JSON.stringify(payload)}\n`);
    }
  }
});

process.on('SIGTERM', () => {
  Sentry.flush(2000).then(
    () => process.exit(0),
    () => process.exit(0),
  );
});

module.exports = Sentry;
