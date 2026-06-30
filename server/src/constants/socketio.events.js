export const SOCKET_IO_EVENTS = Object.freeze({
    CONNECTION: "connection",
    MESSAGE: "message",
    DISCONNECT: "disconnect",
    RECONNECT: "reconnect",
    PING: "ping",
    JOIN: "join",
    LEAVE: "leave",
    // Custom events
    FEATURE_UPDATED: "feature_updated",
    FEATURE_ADDED: "feature_added",
    FEATURE_DELETED: "feature_deleted",
    CATEGORY_UPDATED: "category_updated",
    CATEGORY_ADDED: "category_added",
    CATEGORY_DELETED: "category_deleted",
    PROJECT_UPDATED: "project_updated",
    PROJECT_DELETED: "project_deleted",
});
