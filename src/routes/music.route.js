import express from 'express';
import multer from 'multer';
import * as musicController from '../controllers/music.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage()
});

/* POST /api/music/upload */
router.post('/upload', authMiddleware.authArtistMiddleware, upload.fields([
    { name: 'music', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
]), musicController.uploadMusic)

// GET /api/music 
router.get('/', authMiddleware.authUserMiddleware, musicController.getAllMusic);


router.get('/get-details/:id', authMiddleware.authArtistMiddleware, musicController.getMusicById)

//  GET /api/music/artist-musics 
router.get('/artist-musics', authMiddleware.authArtistMiddleware, musicController.getArtistMusics)

// POST /api/music/playlist
router.post('/playlist', authMiddleware.authArtistMiddleware, musicController.createPlaylist);

// GET /api/music/playlist/artist 
router.get('/playlist/artist', authMiddleware.authUserMiddleware, musicController.getArtistPlaylist)

//GET /api/music/playlists
router.get('/playlists', authMiddleware.authUserMiddleware, musicController.getPlaylists)

//GET /api/music/playlist/:id
router.get('/playlist/:id', authMiddleware.authUserMiddleware, musicController.getPlaylistById)


export default router;
