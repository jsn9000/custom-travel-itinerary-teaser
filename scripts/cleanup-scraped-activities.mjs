import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const tripId = 'bab29d55-7e10-46ed-b702-e0f2a342fcd7';

async function cleanupScrapedActivityImages() {
  console.log('🧹 Cleaning up scraped activity images (keeping Wanderlog images)...\n');

  // Get all images for this trip
  const { data: allImages, error: fetchError } = await supabase
    .from('wanderlog_images')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true });

  if (fetchError) {
    console.error('Error fetching images:', fetchError);
    return;
  }

  // Determine the import cutoff (1 minute after first image)
  const oldestDate = new Date(allImages[0].created_at);
  const importCutoff = new Date(oldestDate.getTime() + 60000);

  // Find scraped activity images (created after import, section = 'activity')
  const scrapedActivityImages = allImages.filter(img =>
    new Date(img.created_at) >= importCutoff &&
    img.associated_section === 'activity'
  );

  console.log(`Found ${scrapedActivityImages.length} scraped activity images to remove`);
  scrapedActivityImages.forEach(img => {
    console.log(`   - ${img.caption || 'Unnamed'} (ID: ${img.id})`);
  });

  if (scrapedActivityImages.length === 0) {
    console.log('\n✅ No scraped activity images to remove');
    return;
  }

  // Delete scraped activity images
  const { error: deleteError } = await supabase
    .from('wanderlog_images')
    .delete()
    .in('id', scrapedActivityImages.map(img => img.id));

  if (deleteError) {
    console.error('\n❌ Error deleting images:', deleteError);
    return;
  }

  console.log(`\n✅ Successfully removed ${scrapedActivityImages.length} scraped activity images`);
  console.log('📸 Wanderlog activity images are now the primary source');
  console.log('🍽️  Scraped dining images have been kept (Wanderlog had none)');
}

cleanupScrapedActivityImages().catch(console.error);
