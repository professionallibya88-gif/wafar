const { supportTicketRepository } = require('./apps/backend/src/repositories');
const { SupportTicket, User, SupportMessage } = require('./apps/backend/src/database/models');

async function test() {
  try {
    const res = await supportTicketRepository.findAllWithDetails({ user_id: '96e358e5-ca77-4711-bee1-20418d54dee2' });
    console.log(res);
  } catch (err) {
    console.error(err);
  }
}

test();
