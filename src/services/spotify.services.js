import axios from 'axios';
import config from '../config/config.js';

const CLIENT_ID = config.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = config.SPOTIFY_CLIENT_SECRET;

let spotifyToken = null;
let tokenExpiration = 0;

async function getAccessToken() {
    // Return cached token if valid
    if (spotifyToken && Date.now() < tokenExpiration) {
        return spotifyToken;
    }

    console.log("🔄 Getting new Spotify Token...");
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    try {
        // ✅ CORRECT URL: Spotify Accounts Service
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            new URLSearchParams({ grant_type: 'client_credentials' }), {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        spotifyToken = response.data.access_token;
        tokenExpiration = Date.now() + ((response.data.expires_in - 60) * 1000);
        console.log("✅ Spotify Token Acquired!");
        return spotifyToken;
    } catch (err) {
        console.error("❌ Spotify Auth Failed:", err.response?.data || err.message);
        throw new Error("Failed to connect to Spotify");
    }
}

// -------------------- updated getSpotifyRecommendations --------------------
export async function getSpotifyRecommendations(mood) {
    try {
        const token = await getAccessToken();

        const GENRE_MAP = {
            happy: "pop",
            sad: "acoustic",
            angry: "rock",
            neutral: "ambient"
        };
        const seed_genres = GENRE_MAP[mood] || "pop";

        console.log(`🔎 Querying Spotify recommendations for mood=${mood}, seed_genres=${seed_genres}...`);

        // Use Recommendations endpoint (seed_genres) instead of search with genre:...
        const response = await axios.get('https://api.spotify.com/v1/recommendations', {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                seed_genres: seed_genres,
                limit: 12,
                market: 'US'
            }
        });

        // Debug log entire response shape so you can inspect it in server logs
        console.log('SPOTIFY RECOMMENDATIONS RESPONSE (partial):', {
            seeds: response.data.seeds?.map(s => s.id),
            tracks_count: response.data.tracks?.length
        });

        const tracks = response.data.tracks || [];
        console.log(`✅ Spotify returned ${tracks.length} recommended tracks for ${mood}`);

        return tracks.map(track => ({
            id: track.id,
            title: track.name || 'Unknown title',
            artist: track.artists && track.artists[0] ? track.artists[0].name : 'Unknown artist',
            coverImageUrl: (track.album && track.album.images && track.album.images[0]) ? track.album.images[0].url : '',
            musicUrl: track.preview_url || null,
            mood,
            source: 'spotify'
        }));
    } catch (err) {
        // print full error so you can see status / message in server logs
        console.error(`❌ getSpotifyRecommendations error for mood=${mood}:`, {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data
        });
        return [];
    }
}
