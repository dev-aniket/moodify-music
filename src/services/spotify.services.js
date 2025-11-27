import axios from 'axios';
import config from '../config/config.js';

const CLIENT_ID = config.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = config.SPOTIFY_CLIENT_SECRET;

// OFFICIAL URLS 
const SPOTIFY_TOKEN_URL = "https://" + "accounts.spotify.com/api/token";
const SPOTIFY_SEARCH_URL = "https://" + "api.spotify.com/v1/search";

let spotifyToken = null;
let tokenExpiration = 0;

async function getAccessToken() {
    if (spotifyToken && Date.now() < tokenExpiration) {
        return spotifyToken;
    }

    console.log("🔄 Getting new Spotify Token...");
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    try {
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
        const searchQuery = mood; 

        console.log(`🔎 Searching Spotify for: "${searchQuery}"...`);

        const response = await axios.get(SPOTIFY_SEARCH_URL, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                q: searchQuery, 
                type: 'track',
                limit: 18,   // Request 10 songs
                market: 'IN' 
            }
        });

        const allTracks = response.data.tracks.items;
        
        const validTracks = allTracks; 

        console.log(`✅ Spotify returned ${validTracks.length} tracks for ${mood}`);

        return validTracks.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artists[0].name,
            coverImageUrl: track.album.images[0]?.url || '',
            musicUrl: track.preview_url, // Might be null (handled by frontend)
            externalUrl: track.external_urls.spotify, // Link to open App
            mood: mood,
            source: 'spotify' 
        }));

    } catch (err) {
        console.error(`❌ API Error (${mood}):`, err.response?.data || err.message);
        return [];
    }
}