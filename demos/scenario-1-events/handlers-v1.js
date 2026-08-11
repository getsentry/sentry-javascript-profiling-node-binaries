// GET /api/events handler, v1: maps event rows to response DTOs.
const { getEvents } = require('./data');

function toDto(e) {
  const dto = { id: e.id, message: e.message, level: e.level };
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
