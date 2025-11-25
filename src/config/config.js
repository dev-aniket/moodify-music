import {config as dotenvConfig} from 'dotenv';

dotenvConfig();

const _config = {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    AWS_SECRET_ACCESS_KEY:process.env.AWS_SECRET_ACCESS_KEY,
    AWS_ACCESS_KEY_ID:process.env.AWS_ACCESS_KEY_ID,
    AWS_REGION:process.env.AWS_REGION,
    SPOTIFY_CLIENT_ID:process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET:process.env.SPOTIFY_CLIENT_SECRET
}

export default Object.freeze(_config);