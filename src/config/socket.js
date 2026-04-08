const { Server } = require("socket.io");
const logger = require("./logger");

let io;

function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        logger.info("A user connected", { socketId: socket.id });

        socket.on("join_room", (data) => {
            socket.join(data.room);
            logger.info(`User joined room`, { socketId: socket.id, room: data.room });
        });

        socket.on("disconnect", () => {
            logger.info("User disconnected", { socketId: socket.id });
        });
    });

    return io;
}

function getIo() {
    if (!io) {
        throw new Error("Socket.IO not initialized. Call initSocket() first.");
    }
    return io;
}

module.exports = { initSocket, getIo };