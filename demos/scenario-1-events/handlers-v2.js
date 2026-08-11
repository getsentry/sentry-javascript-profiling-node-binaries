// GET /api/events handler, v2: the "customer PR" adds stack traces to error
// DTOs so the frontend can render them inline.
//
// The diff vs v1 is the two lines in toDto. Innocent-looking, but DTOs that
// take the branch get a different hidden class, turning every downstream
// monomorphic property access polymorphic and deoptimizing the hot path.
const { getEvents } = require('./data');

function toDto(e) {
  const dto = { id: e.id, message: e.message, level: e.level };
  if (e.stack) {
    dto.stack = e.stack;
  }
  return dto;
}

function mapEvents(events) {
  const dtos = [];
  for (let i = 0; i < events.length; i++) {
    dtos.push(toDto(events[i]));
  }
  return dtos;
}

// Computes response metadata over the full DTO list before pagination.
function summarizeDtos(dtos) {
  let bytes = 0;
  let errors = 0;
  for (let i = 0; i < dtos.length; i++) {
    const d = dtos[i];
    bytes += d.message.length + d.level.length;
    if (d.level === 'error') errors++;
  }
  return { bytes, errors };
}

function eventsHandler(req) {
  const events = getEvents(req.query.batch);
  const dtos = mapEvents(events);
  const summary = summarizeDtos(dtos);
  return {
    total: dtos.length,
    summary,
    events: dtos.slice(0, 25),
  };
}

module.exports = { eventsHandler };
