import express from 'express';
import multer from 'multer';
import * as musicController from '../controllers/music.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage()
});

/* --- UPLOADS (Keep Protected) --- */
router.post('/upload', authMiddleware.authArtistMiddleware, upload.fields([
    { name: 'music', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
]), musicController.uploadMusic)


/* --- PUBLIC ROUTES (Middleware Removed) --- */

// 1. Get All Music (Home Page Community) - PUBLIC
router.get('/', musicController.getAllMusic);

// 2. Get Spotify Moods (Home Page Spotify) - PUBLIC
router.get('/spotify/home', musicController.getMoodHome);

// 3. Get Playlists (Home Page) - PUBLIC
router.get('/playlists', musicController.getPlaylists);

// 4. Get specific details - PUBLIC
router.get('/playlist/:id', musicController.getPlaylistById)


/* --- PROTECTED ROUTES (Keep Protected) --- */

// Artist specific stats
router.get('/artist-musics', authMiddleware.authArtistMiddleware, musicController.getArtistMusics)

// Create Playlist
router.post('/playlist', authMiddleware.authArtistMiddleware, musicController.createPlaylist);

// Artist specific playlists
router.get('/playlist/artist', authMiddleware.authUserMiddleware, musicController.getArtistPlaylist)

// Get music details (used in player) - Keep public or protected? 
// Let's make it Protected only if you want only users to listen, 
// BUT for now, let's allow public so the player works:
router.get('/get-details/:id', musicController.getMusicById) 

export default router;