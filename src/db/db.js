import mongoose from "mongoose";
import config from "../config/config.js";

async function connectDB(){

    try{
        await mongoose.connect(config.MONGODB_URI);
        console.log("Connected to DB")
    }
    catch(err){
        console.log("Error", err)
    }

}


export default connectDB;