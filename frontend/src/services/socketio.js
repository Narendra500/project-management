import { SOCKET_IO_EVENTS } from "#constants/socketioEvents";
import { useTreeContext } from "#contexts/TreeContext";
import { TREE_UPDATE_TYPES, updateTree } from "#utils/tree";
import io from "socket.io-client";

export const socket = io("http://localhost:8080", {
    withCredentials: true,
});

export function connectSocket() {
    if (!socket.connected) {
        socket.connect();
    }
}

export function disconnectSocket() {
    if (socket.connected) {
        socket.disconnect();
    }
}

export function getSocket() {
    connectSocket();
    return socket;
}

export function registerProjectUpdateListeners(treeData, setTreeData) {
    const socket = getSocket();

    socket.on(SOCKET_IO_EVENTS.CATEGORY_ADDED, (data) => {
        updateTree(TREE_UPDATE_TYPES.ADD_CATEGORY, treeData, setTreeData, data);
    });

    socket.on(SOCKET_IO_EVENTS.FEATURE_ADDED, (data) => {
        updateTree(TREE_UPDATE_TYPES.ADD_FEATURE, treeData, setTreeData, data);
    });

    socket.on(SOCKET_IO_EVENTS.CATEGORY_UPDATED, (data) => {
        updateTree(TREE_UPDATE_TYPES.UPDATE_CATEGORY, treeData, setTreeData, data);
    });
}

socket.on(SOCKET_IO_EVENTS.CONNECT, () => {
    console.log("Connected");
});

socket.on(SOCKET_IO_EVENTS.CONNECT_ERROR, (err) => {
    console.error("Connection failed: ", err.message);
});
