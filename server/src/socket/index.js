import { Server } from "socket.io";
import { socketIOAuthMiddleware } from "./auth.js";
import { getUserById } from "#services/user.services";
import { SOCKET_IO_EVENTS } from "#constants/socketio.events";

let io;

export function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173"],
            credentials: true,
        },
    });

    io.use(socketIOAuthMiddleware);

    io.on(SOCKET_IO_EVENTS.CONNECTION, async (socket) => {
        console.log(`Socket connected: ${socket.id}, User ID: ${socket.userId}`);

        try {
            if (socket.userId) {
                const user = await getUserById(socket.userId);
                if (user && user.activeProjectUuid) {
                    socket.join(user.activeProjectUuid);
                    console.log(`User ${socket.userId} joined room: ${user.activeProjectUuid}`);
                } else {
                    console.log(`User ${socket.userId} has no active project`);
                }
            }
        } catch (err) {
            console.error("Error in socket connection room joining:", err);
        }

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io is not initialized yet!");
    }
    return io;
}
