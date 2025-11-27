import { uploadFile, getPresignedUrl } from "../services/storage.services.js";
import musicModel from "../models/music.model.js";
import playlistModel from "../models/playlist.model.js";
import { getSpotifyRecommendations } from "../services/spotify.services.js";
import axios from "axios";



export async function uploadMusic(req, res) {
    // SAFETY CHECK
    if (!req.files || !req.files['music'] || !req.files['coverImage']) {
        return res.status(400).json({ message: 'Music and Cover Image are required' });
    }

    const musicFile = req.files['music'][0];
    const coverImageFile = req.files['coverImage'][0];
    
    // Extract mood from body (default to neutral if missing)
    const { title, mood = 'neutral' } = req.body;

    try {
        const musicKey = await uploadFile(musicFile);
        const coverImageKey = await uploadFile(coverImageFile);

        const music = await musicModel.create({
            title: title,
            artist: req.user.fullname ? `${req.user.fullname.firstName} ${req.user.fullname.lastName}` : "Unknown Artist",
            artistId: req.user.id,
            musicKey,
            coverImageKey,
            mood: mood.toLowerCase() // Save the mood
        })

        return res.status(201).json({ message: 'Music uploaded successfully', music });

    } catch (err) {
        console.log("Upload Error:", err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getAllMusic(req, res){
    const {skip = 0, limit = 10} = req.query;

    try{
         const musicsDocs = await musicModel.find().skip(skip).limit(limit).lean();
         
         const musics = await Promise.all(musicsDocs.map(async (music) => {
            return {
                ...music,
                musicUrl: await getPresignedUrl(music.musicKey),
                coverImageUrl: await getPresignedUrl(music.coverImageKey),
                mood: music.mood || 'neutral' // Return mood (fallback to neutral)
            };
         }));

        return res.status(200).json({ message:"Musics fetched successfully", musics });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getMusicById(req, res){
     const { id } = req.params;

    try {
        const music = await musicModel.findById(id).lean();

        if (!music) {
            return res.status(404).json({ message: 'Music not found' });
        }

        music.musicUrl = await getPresignedUrl(music.musicKey);
        music.coverImageUrl = await getPresignedUrl(music.coverImageKey);

        return res.status(200).json({ music });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getArtistMusics(req, res) {
    try {
        const musicsDocs = await musicModel.find({ artistId: req.user.id }).lean();

        const musics = await Promise.all(musicsDocs.map(async (music) => {
            return {
                ...music,
                musicUrl: await getPresignedUrl(music.musicKey),
                coverImageUrl: await getPresignedUrl(music.coverImageKey),
                mood: music.mood || 'neutral'
            };
         }));

        return res.status(200).json({ musics });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function createPlaylist(req, res) {
    // Frontend now sends 'songs', not 'musics'
    const { title, songs } = req.body; 

    try {
        const playlist = await playlistModel.create({
            // Use the logged-in user's name
            artist: req.user.fullname.firstName + " " + req.user.fullname.lastName,
            artistId: req.user.id,
            title,
            songs // Save the array of song objects directly
        })

        return res.status(201).json({ message: 'Playlist created successfully', playlist });

    } catch (err) {
        console.log("Create Playlist Error:", err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Logic Fix: Return ALL playlists for Home Page discovery
export async function getPlaylists(req, res) {
    try {
        const playlists = await playlistModel.find({}); 
        return res.status(200).json({ playlists });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getPlaylistById(req, res){
    const { id } = req.params;

    try {
        const playlistDoc = await playlistModel.findById(id).lean();

        if (!playlistDoc) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Map 'songs' to 'musics' for backward compatibility with your frontend list
        // Your PlaylistDetails.jsx likely expects 'musics'
        playlistDoc.musics = playlistDoc.songs || [];

        return res.status(200).json({ playlist: playlistDoc });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Logic Fix: Return ONLY artist playlists for Dashboard
export async function getArtistPlaylist(req, res) {
    try {
        const playlists = await playlistModel.find({ artistId: req.user.id })
        return res.status(200).json({ playlists });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getMoodHome(req, res) {
    console.log("🔥 HIT: /spotify/home");

    try {
        const [happy, sad, angry, neutral] = await Promise.all([
            getSpotifyRecommendations('happy'),
            getSpotifyRecommendations('sad'),
            getSpotifyRecommendations('angry'),
            getSpotifyRecommendations('neutral')
        ]);

        console.log("🔥 SPOTIFY RESULT:", {
            happy: happy.length,
            sad: sad.length,
            angry: angry.length,
            neutral: neutral.length
        });

        return res.status(200).json({
            happy, sad, angry, neutral
        });
    } catch (err) {
        console.log("🔥 ERROR:", err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}




export async function testSpotify(req, res) {
  try {
    const r = await axios.get("https://api.spotify.com/v1");
    return res.json({ success: true, data: r.data });
  } catch (err) {
    console.log("🔥 OUTBOUND TEST ERROR:", err.code, err.message);
    return res.json({ success: false, error: err.code });
  }
}

