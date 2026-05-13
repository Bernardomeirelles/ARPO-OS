import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE;
const ORG_ID = process.env.SEED_ORG_ID || '11111111-1111-1111-1111-111111111111';

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

async function run() {
  console.log('Clearing seeded data for organization:', ORG_ID);

  // Order matters due to foreign keys: delete child tables first
  const tables = [
    'activities',
    'tasks',
    'files',
    'notifications',
    'deals',
    'clients',
    'leads',
    'pipeline_stages',
    'user_profiles'
  ];

  for (const table of tables) {
    try {
      const { error, count } = await supabase.from(table).delete().eq('organization_id', ORG_ID).select('*', { count: 'exact' });
      if (error) {
        console.error(`Error deleting from ${table}:`, error.message || error);
      } else {
        console.log(`Deleted ${count ?? 0} rows from ${table}`);
      }
    } catch (err) {
      console.error(`Exception deleting from ${table}:`, err);
    }
  }

  // Finally delete organization row
  try {
    const { error, count } = await supabase.from('organizations').delete().eq('id', ORG_ID).select('*', { count: 'exact' });
    if (error) console.error('Error deleting organization:', error.message || error);
    else console.log(`Deleted ${count ?? 0} organization rows`);
  } catch (err) {
    console.error('Exception deleting organization:', err);
  }

  console.log('Seed clear complete.');
}

run().then(() => process.exit(0)).catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
