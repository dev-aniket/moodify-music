import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    // We keep artist fields to know WHO created the playlist
    artist: {
        type: String,
        required: true
    },
    artistId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    // CHANGED: 'songs' array stores full objects now, not just IDs
    songs: [ {
        id: String,          // Can be MongoDB ID or Spotify ID
        title: String,
        artist: String,
        coverImageUrl: String,
        musicUrl: String,
        externalUrl: String,
        source: String,      // 'spotify' or 'db'
        addedAt: { type: Date, default: Date.now }
    } ]
}, { timestamps: true })

const playlistModel = mongoose.model('playlist', playlistSchema);

export default playlistModel;