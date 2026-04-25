require('dotenv').config();
const http = require("http");
const app = require('./app');
const config = require('./config');
const { initSocket } = require('./config/socket');
const logger = require('./config/logger');

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(config.port, () => {
    logger.info(`Server is running on port ${config.port}`);
});
