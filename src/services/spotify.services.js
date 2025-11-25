import axios from 'axios';
import config from '../config/config.js'; // Import your central config

const CLIENT_ID = config.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = config.SPOTIFY_CLIENT_SECRET;

let spotifyToken = null;
let tokenExpiration = 0;

async function getAccessToken() {
    if (spotifyToken && Date.now() < tokenExpiration) {
        return spotifyToken;
    }

    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            new URLSearchParams({ grant_type: 'client_credentials' }), {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        spotifyToken = response.data.access_token;
        tokenExpiration = Date.now() + ((response.data.expires_in - 60) * 1000);
        return spotifyToken;
    } catch (err) {
        console.error("Spotify Auth Error:", err.response?.data || err.message);
        throw new Error("Failed to connect to Spotify");
    }
}

const MOOD_MAP = {
    happy: { min_valence: 0.7, min_energy: 0.6 },
    sad: { max_valence: 0.4, max_energy: 0.4 },
    angry: { max_valence: 0.4, min_energy: 0.7 },
    neutral: { min_valence: 0.4, max_valence: 0.6, max_energy: 0.5 }
};

export async function getSpotifyRecommendations(mood) {
    try {
        const token = await getAccessToken();
        const features = MOOD_MAP[mood] || MOOD_MAP.neutral;
        const seed_genres = "pop,rock,indie,r-n-b,acoustic"; 

        const response = await axios.get('https://api.spotify.com/v1/recommendations', {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                seed_genres,
                limit: 10, 
                market: 'US', 
                ...features
            }
        });

        return response.data.tracks
            .filter(t => t.preview_url) 
            .map(track => ({
                id: track.id,
                title: track.name,
                artist: track.artists[0].name,
                coverImageUrl: track.album.images[0]?.url || '',
                musicUrl: track.preview_url, 
                mood: mood,
                source: 'spotify' 
            }));

    } catch (err) {
        console.error(`Spotify Fetch Error (${mood}):`, err.response?.data || err.message);
        return [];
    }
}