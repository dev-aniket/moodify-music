import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import cookie from 'cookie';



function initSocketServer(httpServer) {

    console.log("Initializing Socket Server");

    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    })

    console.log("Socket Server Initialized");

    io.use((socket, next) => {

        const cookies = cookie.parse(socket.handshake.headers.cookie || '');

        const token = cookies.token;

        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {

            const decoded = jwt.verify(token, config.JWT_SECRET);

            socket.user = decoded;

            next();

        } catch (err) {
            return next(new Error('Authentication error'));
        }


    })

    io.on('connection', (socket) => {

        console.log('a user connected', socket.user);

        socket.join(socket.user.id);

        socket.on("play", (data) => {
            const musicId = data.musicId;
            socket.broadcast.to(socket.user.id).emit("play", { musicId });
        })

        socket.on('disconnect', () => {
            socket.leave(socket.user.id);
        })

    })

}


export default initSocketServer;