const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
    );

    function haversineDistance(lat1, lon1, lat2, lon2) {
      const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
                      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                      }

                      module.exports = async (req, res) => {
                        res.setHeader('Access-Control-Allow-Origin', '*');
                          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
                            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                              if (req.method === 'OPTIONS') return res.status(200).end();

                                const { lat, lng, exclude_id, radius_miles } = req.query;
                                  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });

                                    const radiusMiles = parseFloat(radius_miles) || 50;
                                      const radiusKm = radiusMiles * 1.60934;

                                        const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();

                                          const { data, error } = await supabase
                                              .from('listeners')
                                                  .select('spotify_id, display_name, track_name, artist_name, album_art, latitude, longitude, updated_at, top_artists, top_tracks, genres')
                                                      .gte('updated_at', cutoff);

                                                        if (error) return res.status(500).json({ error: error.message });

                                                          const userLat = parseFloat(lat);
                                                            const userLng = parseFloat(lng);

                                                              const listeners = (data || [])
                                                                  .filter(l => l.spotify_id !== exclude_id)
                                                                      .map(l => ({
                                                                            ...l,
                                                                                  distance: haversineDistance(userLat, userLng, l.latitude, l.longitude)
                                                                                      }))
                                                                                          .filter(l => l.distance <= radiusKm)
                                                                                              .sort((a, b) => a.distance - b.distance);

                                                                                                return res.status(200).json({ listeners });
                                                                                                };