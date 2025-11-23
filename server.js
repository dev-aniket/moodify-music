import app from './src/app.js';
import connectDB from './src/db/db.js';
import initSocketServer from './src/socket/socket.server.js';
import http from 'http';

const httpServer = http.createServer(app)

connectDB();

initSocketServer(httpServer)

httpServer.listen(3002, ()=>{
    console.log("Music server is running on port 3002")
})