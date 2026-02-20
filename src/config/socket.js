const { Server } = require("socket.io");

let io;

function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("A user connected", socket.id);

        socket.on("join_room", (data) => {
            socket.join(data.room);
            console.log(`User ${socket.id} joined room ${data.room}`);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected", socket.id);
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