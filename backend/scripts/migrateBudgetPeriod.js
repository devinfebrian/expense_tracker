// One-time migration: backfill `period` field on existing Budget docs.
//
// Run:  node scripts/migrateBudgetPeriod.js
//
// Idempotent — skips docs that already have a non-empty `period`.
// Safe to re-run after partial failures.
//
// After this script finishes AND the audit aggregation (see PR description)
// shows zero duplicates on (user_id, category_id, type, period), the
// compound unique index can be added in a follow-up commit.

import 'dotenv/config';
import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import { getCurrentPeriod } from '../utils/period.js';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set. Configure backend/.env.');
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const docs = await Budget.find({ $or: [{ period: { $exists: false } }, { period: null }, { period: '' }] });
  console.log(`Found ${docs.length} budget(s) missing period`);

  let updated = 0;
  for (const b of docs) {
    const period = getCurrentPeriod(b.type, b.createdAt);
    b.period = period;
    await b.save();
    updated += 1;
    console.log(`  budget_id=${b.budget_id} type=${b.type} createdAt=${b.createdAt.toISOString()} -> period=${period}`);
  }

  console.log(`Updated ${updated} budget(s)`);

  // Audit duplicates on the new compound key.
  const dupes = await Budget.aggregate([
    { $group: {
      _id: { user_id: '$user_id', category_id: '$category_id', type: '$type', period: '$period' },
      count: { $sum: 1 },
      ids: { $push: '$budget_id' },
    } },
    { $match: { count: { $gt: 1 } } },
  ]);
  if (dupes.length === 0) {
    console.log('Audit: no duplicates on (user_id, category_id, type, period). Safe to add unique index.');
  } else {
    console.warn(`Audit: ${dupes.length} duplicate group(s) found. Resolve before adding unique index:`);
    dupes.forEach(d => console.warn(`  ${JSON.stringify(d._id)} ids=${d.ids.join(', ')}`));
  }

  await mongoose.disconnect();
  console.log('Done');
};

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});