const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { spotify_id, display_name, track_name, artist_name, album_art, latitude, longitude } = req.body;

  if (!spotify_id) return res.status(400).json({ error: 'spotify_id required' });

  const { error } = await supabase
    .from('listeners')
    .upsert({
      spotify_id,
      display_name,
      track_name,
      artist_name,
      album_art,
      latitude,
      longitude,
      updated_at: new Date().toISOString()
    }, { onConflict: 'spotify_id' });

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ success: true });
};