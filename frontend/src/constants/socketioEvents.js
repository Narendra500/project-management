export const SOCKET_IO_EVENTS = Object.freeze({
    CONNECT: "connect",
    CONNECT_ERROR: "connect_error",
    RECONNECT: "reconnect",
    RECONNECT_ERROR: "reconnect_error",
    RECONNECT_FAILED: "reconnect_failed",
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
