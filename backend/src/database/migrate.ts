import path from 'path';
import { runner } from 'node-pg-migrate';
import { dbConfig } from './config';

// Usage:
//   npm run migrate              -> apply all pending migrations
//   npm run migrate:down         -> undo the most recent migration
//   npm run migrate -- --fake    -> mark pending migrations as applied
//                                   without running them (for databases
//                                   whose tables already exist)

const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');

async function migrate() {
  const args = process.argv.slice(2);

  const direction = args.includes('down') ? 'down' : 'up';
  const fake = args.includes('--fake');

  const applied = await runner({
    databaseUrl: dbConfig,
    dir: MIGRATIONS_DIR,
    migrationsTable: 'pgmigrations',
    direction,
    count: direction === 'down' ? 1 : Infinity,
    fake
  });

  if (applied.length === 0) {
    console.log('✅ No migrations to run');
  } else {
    console.log(
      `✅ ${direction === 'up' ? 'Applied' : 'Reverted'}:`,
      applied.map((migration) => migration.name).join(', ')
    );
  }
}

migrate().catch((error) => {
  console.error('❌ Migration failed');
  console.error(error);
  process.exit(1);
});
