import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function fixDbDuplicateImages() {
  console.log('🔍 Connecting to Supabase database to clean up duplicate stock images...');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase.from('articles').select('slug, title, image_url');

  if (error || !data) {
    console.error('❌ Failed to fetch database articles:', error?.message);
    return;
  }

  // Count image occurrences
  const imageCounts: Record<string, number> = {};
  for (const doc of data) {
    const img = doc.image_url || '';
    if (img && img !== '/images/placeholder.svg' && img.startsWith('http')) {
      imageCounts[img] = (imageCounts[img] || 0) + 1;
    }
  }

  // Find images that are duplicated (used more than twice across articles)
  const duplicateImages = new Set(
    Object.entries(imageCounts)
      .filter(([_, count]) => count > 2)
      .map(([img]) => img)
  );

  console.log(`📌 Found ${duplicateImages.size} stock images used repeatedly across multiple database articles.`);

  let updatedCount = 0;
  for (const doc of data) {
    const img = doc.image_url || '';
    if (duplicateImages.has(img) || img.includes('photo-1540910419892-4a36d2c3266c') || img.includes('photo-1611162617474-5b21e879e113')) {
      console.log(`Replacing duplicate stock image for: "${doc.title.substring(0, 45)}" -> /images/placeholder.svg`);
      await supabase.from('articles').update({ image_url: '/images/placeholder.svg' }).eq('slug', doc.slug);
      updatedCount++;
    }
  }

  console.log(`\n🎉 DATABASE IMAGE CLEANUP COMPLETE! Replaced ${updatedCount} duplicate stock image entries with WhyThisBuzz placeholder!`);
}

fixDbDuplicateImages();
