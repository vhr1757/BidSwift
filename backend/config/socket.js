import { Server } from "socket.io";

let io = null;

const initializeSocket = (httpServer) => {

    io = new Server(
        httpServer,
        {
            cors: {
                origin: "http://localhost:5173"
            }
        }
    );

    return io;
};

const getIO = () => {

    if (!io) {

        throw new Error(
            "Socket.IO has not been initialized"
        );

    }

    return io;
};


export {
    initializeSocket,
    getIO
};