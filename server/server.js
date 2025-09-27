import express from "express";
import cookieParser from "cookie-parser";
import apiRouter from "#api/index";
import errorHandler from "#middlewares/error.middleware";
import dotenv from "dotenv";
import cors from "cors";
import { HTTP_RESPONSE_CODE } from "#constants/api.response.codes";

dotenv.config();

const PORT = process.env.PORT;
const app = express();

// middleware for cross origin requests
const whitelist = ["http://localhost:5173"];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // to allow cookies
};
app.use(cors(corsOptions));

// middleware for parsing json
app.use(express.json());

// middleware for parsing cookies
app.use(cookieParser());

// mount API router
app.use("/api", apiRouter);

// *splat matchs all paths, so if none of the api routes were matched then we can return 404 not found
app.all("/{*splat}", function (req, res) {
    res.status(HTTP_RESPONSE_CODE.NOT_FOUND).send("Not found");
});

// mount the error handler at last, this allows errorHandler to catch all error from everything defined before it
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server has started on port: ${PORT}`);
});
