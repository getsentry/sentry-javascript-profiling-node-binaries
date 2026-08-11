// In-memory event store. Every event has the same shape (uniform hidden
// class): `stack` is always present, a string for error events in incident
// batches and null otherwise.
const LEVELS = ['info', 'warn', 'error'];

function makeEvents(count, withStacks) {
  const events = [];
  for (let i = 0; i < count; i++) {
    const level = LEVELS[i % 3];
    events.push({
      id: i,
      message: `request pipeline event ${i % 17}: upstream responded in ${(i % 90) + 10}ms`,
      level,
      stack:
        withStacks && level === 'error'
          ? 'Error: upstream timeout\n    at fetchUpstream (/app/src/lib/upstream.js:87:9)\n    at handler (/app/src/routes/events.js:42:11)'
          : null,
    });
  }
  return events;
}

const NORMAL_BATCH = makeEvents(2000, false);
const INCIDENT_BATCH = makeEvents(2000, true);

function getEvents(batch) {
  return batch === 'incidents' ? INCIDENT_BATCH : NORMAL_BATCH;
}

module.exports = { getEvents };
