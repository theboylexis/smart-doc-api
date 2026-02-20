const http = require("http");
const app = require('./app');
const config = require('./config');
const { initSocket } = require('./config/socket');

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});