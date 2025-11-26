import axios from 'axios';
import config from '../config/config.js';

const CLIENT_ID = config.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = config.SPOTIFY_CLIENT_SECRET;

// 👇 SPLITTING STRINGS TO PREVENT AUTO-REPLACEMENT ERRORS 👇
const SPOTIFY_TOKEN_URL = "https://" + "accounts.spotify.com" + "/api/token";
const SPOTIFY_SEARCH_URL = "https://" + "api.spotify.com" + "/v1/search";

let spotifyToken = null;
let tokenExpiration = 0;

async function getAccessToken() {
    if (spotifyToken && Date.now() < tokenExpiration) {
        return spotifyToken;
    }

    console.log("🔄 Getting new Spotify Token...");
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    try {
        // Using the constructed variable
        const response = await axios.post(SPOTIFY_TOKEN_URL, 
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

export async function getSpotifyRecommendations(mood) {
    try {
        const token = await getAccessToken();
        
        // Simple text search guarantees results
        const searchQuery = mood; 

        console.log(`🔎 Searching Spotify for: "${searchQuery}"...`);

        // Using the constructed variable
        const response = await axios.get(SPOTIFY_SEARCH_URL, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                q: searchQuery, 
                type: 'track',
                limit: 10
                // Removed 'market' to allow global availability
            }
        });

        const tracks = response.data.tracks.items;
        console.log(`✅ Spotify returned ${tracks.length} tracks for ${mood}`);

        return tracks.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artists[0].name,
            coverImageUrl: track.album.images[0]?.url || '',
            musicUrl: track.preview_url, 
            mood: mood,
            source: 'spotify' 
        }));

    } catch (err) {
        console.error(`❌ API Error (${mood}):`, err.response?.data || err.message);
        return [];
    }
}