import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Needs service role to list all files

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupBucket(bucketName: string, tableName: string, columnPath: string) {
  console.log(`Cleaning up bucket: ${bucketName}...`);

  // 1. Get all files in storage
  const { data: storageFiles, error: storageError } = await supabase.storage
    .from(bucketName)
    .list('', { limit: 1000 });

  if (storageError) {
    console.error(`Error listing storage files for ${bucketName}:`, storageError);
    return;
  }

  // 2. Get all file paths in DB
  const { data: dbRecords, error: dbError } = await supabase
    .from(tableName)
    .select(columnPath);

  if (dbError) {
    console.error(`Error fetching DB records for ${tableName}:`, dbError);
    return;
  }

  const dbPaths = new Set(dbRecords.map(r => r[columnPath]));

  // 3. Identify orphans
  const orphans = storageFiles
    .filter(f => !dbPaths.has(f.name))
    .map(f => f.name);

  if (orphans.length === 0) {
    console.log(`No orphans found in ${bucketName}.`);
    return;
  }

  console.log(`Found ${orphans.length} orphans in ${bucketName}:`, orphans);

  // 4. Delete orphans
  const { error: deleteError } = await supabase.storage
    .from(bucketName)
    .remove(orphans);

  if (deleteError) {
    console.error(`Error deleting orphans from ${bucketName}:`, deleteError);
  } else {
    console.log(`Successfully deleted orphans from ${bucketName}.`);
  }
}

async function main() {
  await cleanupBucket('task-evidence', 'activity_evidence', 'evidence_url');
  await cleanupBucket('official-docs', 'documents', 'file_path');
}

main().catch(console.error);
