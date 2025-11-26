import express from 'express';
import musicRoutes from './routes/music.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'


const app = express();

app.use((req, res, next) => {
    console.log(`🔔 HIT: ${req.method} ${req.url}`);
    next();
});


const allowedOrigins = [
  "http://localhost:5173", // Keep this for local development
  "https://moodify-frontend-three.vercel.app" 
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true // Important for cookies/sessions
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/music', musicRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});



export default app;