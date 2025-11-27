import mongoose from 'mongoose';
import musicModel from './src/models/music.model.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log("Connected to DB...");
    // Keep 'Pardesiya' (replace with the exact title you want to keep if different)
    // Deletes everything that DOES NOT contain "Pardesiya" in the title
    const result = await musicModel.deleteMany({ 
        title: { $not: { $regex: "Pardesiya" } } 
    });
    console.log(`Deleted ${result.deletedCount} junk songs.`);
    process.exit();
});