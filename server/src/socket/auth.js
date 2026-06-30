import jwt from "jsonwebtoken";
import sqids from "#config/sqids";

export function socketIOAuthMiddleware(socket, next) {
    const rawCookies = socket.handshake.headers.cookie;

    if (!rawCookies) {
        return next(new Error("Authentication error: No cookies provided"));
    }

    // Parse cookies manually
    const cookies = {};
    rawCookies.split(";").forEach((cookieStr) => {
        const parts = cookieStr.split("=");
        if (parts.length >= 2) {
            cookies[parts[0].trim()] = parts.slice(1).join("=").trim();
        }
    });

    const token = cookies.jwt_token;

    if (!token) {
        return next(new Error("Authentication error: Token missing from cookies"));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
        const decodedSqidId = sqids.decode(decoded.id)[0];
        socket.userId = decodedSqidId;
        next();
    });
}
