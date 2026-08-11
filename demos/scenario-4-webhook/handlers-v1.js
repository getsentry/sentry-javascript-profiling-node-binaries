// POST /webhook handler, v1: every event goes through the default handler;
// type-specific routing hasn't shipped yet.
const handlers = {
  ping: e => e.seq | 0,
  default: e => (e.seq | 0) + 1,
  'order.created': e => e.seq * 2,
  'order.updated': e => e.seq * 3,
  'order.deleted': e => e.seq * 5,
  'user.created': e => e.seq * 7,
  'user.deleted': e => e.seq * 11,
  'invoice.paid': e => e.seq * 13,
  'invoice.voided': e => e.seq * 17,
};

function dispatchEvent(evt) {
  return handlers.default(evt);
}

function webhookHandler(req) {
  const events = req.body.events || [];
  let checksum = 0;
  for (let i = 0; i < events.length; i++) {
    checksum += dispatchEvent(events[i]);
  }
  return { processed: events.length, checksum };
}

module.exports = { webhookHandler };
