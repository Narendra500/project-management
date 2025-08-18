import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import * as authServices from "#services/auth.services";
import { getUserById } from "#services/user.services";
import { ApiResponse } from "#utils/api.response";
import { ApiError } from "#utils/api.error";
import { HTTP_RESPONSE_CODE } from "#constants/api.response.codes";
import sendEmail from "#services/email.services";
import sqids from "#config/sqids";

const saltRounds = 12;

export async function register(req, res) {
    const { userName, password, rememberMe } = req.body;

    // encrypt the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await authServices.checkIfUserExists(userName);
    if (user) {
        throw new ApiError(HTTP_RESPONSE_CODE.CONFLICT, "user already registered, login in instead");
    }

    const createdUser = await authServices.createUser(userName, hashedPassword);
    const encodedCreatedUserId = sqids.encode([createdUser.id]);

    const token = jwt.sign({ id: encodedCreatedUserId }, process.env.JWT_SECRET, {
        expiresIn: rememberMe ? "30d" : "24h", // tokens expires after longer time if remember me option is selected
    });

    const cookieOptions = {
        httpOnly: true, // prevents client side JS from reading the contents of the cookie
        secure: process.env.NODE_ENV === "production", // send cookie over HTTPS when in prod
        sameSite: "strict", // helps prevent CSRF attacks
    };

    if (rememberMe) {
        cookieOptions.expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
    }

    // if rememberMe option is not selected the cookie's expiresAt option is not set making it a session cookie
    // therefore deleting it when browser closes, plus jwt token expires in 24h

    res.cookie("jwt_token", token, cookieOptions)
        .status(HTTP_RESPONSE_CODE.CREATED)
        .json(
            new ApiResponse(HTTP_RESPONSE_CODE.CREATED, { displayName: createdUser.displayName }, "User registered successfuly"),
        );
}

export async function login(req, res) {
    const { userName, password, rememberMe } = req.body;

    const user = await authServices.checkIfUserExists(userName);
    if (!user) {
        // returning both wrong username or password to avoid leaking email to unauthorized users
        throw new ApiError(HTTP_RESPONSE_CODE.UNAUTHORIZED, "Wrong username or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
        throw new ApiError(HTTP_RESPONSE_CODE.UNAUTHORIZED, "Wrong username or password");
    }

    const encodedUserId = sqids.encode([user.id]);

    const token = jwt.sign({ id: encodedUserId }, process.env.JWT_SECRET, {
        expiresIn: rememberMe ? "30d" : "24h", // tokens expires after longer time if remember me option is selected
    });

    const cookieOptions = {
        httpOnly: true, // prevents client side JS from reading the contents of the cookie
        secure: process.env.NODE_ENV === "production", // send cookie over HTTPS when in prod
        sameSite: "strict", // helps prevent CSRF attacks
    };

    if (rememberMe) {
        cookieOptions.expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
    }

    // if rememberMe option is not selected the cookie's expiresAt option is not set making it a session cookie
    // therefore deleting it when browser closes, plus jwt token expires in 24h

    res.cookie("jwt_token", token, cookieOptions)
        .status(HTTP_RESPONSE_CODE.SUCCESS)
        .json(new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, { displayName: user.displayName }, "User logged in successfuly"));
}

export async function logout(req, res) {
    // must pass the same options (path, domain) that were used to set the cookie.
    // Since we only used the defaults, we just need httpOnly, secure, and sameSite.
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    };

    // clearCookie method handles the expiration logic
    res.clearCookie("jwt_token", cookieOptions)
        .status(HTTP_RESPONSE_CODE.SUCCESS)
        .json(new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, {}, "User logged out successfully"));
}

export async function sendLinkForEmailVerification(req, res) {
    const userId = req.userId;

    const user = await getUserById(userId);
    // should never happend unless user was deleted for some reason or server crashed
    if (!user) {
        throw new ApiError(HTTP_RESPONSE_CODE.SERVER_ERROR, "User not found");
    }

    const verificationToken = crypto.randomUUID();
    // set 30 minutes expiration time
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const userTokens = await authServices.getUserTokens(userId);
    let validTokenCount = 0;

    for (const userToken of userTokens) {
        if (userToken.expiresAt > new Date()) {
            validTokenCount++;
        }
    }

    if (validTokenCount >= 2)
        throw new ApiError(
            HTTP_RESPONSE_CODE.BAD_REQUEST,
            "Two valid links already sent for verification, kindly use one of those or try again later",
        );

    const dbToken = await authServices.addUserEmailVerificationToken(userId, verificationToken, expiresAt);
    if (!dbToken)
        throw new ApiError(HTTP_RESPONSE_CODE.SERVER_ERROR, "Couldn't send token due to server error, try again later.");

    // Use your email service to send the verification email
    const verificationLink = `http://localhost:5173/verify-email/${verificationToken}`;

    const emailStatus = await sendEmail({
        to: user.name,
        subject: "Verify Your Orbit Account",
        html: `
      <h1>Welcome to Orbit!</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationLink}">Verify My Email</a>
      <p>The above link is only valid for 30 minutes</p>
    `,
    });

    if (emailStatus.success) {
        res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
            new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, {}, "Verification Link Sent please check the email"),
        );
    } else {
        res.status(HTTP_RESPONSE_CODE.SERVER_ERROR, "Couldn't send token due to issues with mailing service");
    }
}

export async function verifyEmail(req, res) {
    const userId = req.userId;
    const { token } = req.params;

    const user = await getUserById(userId);
    if (user.isVerified)
        return res
            .status(HTTP_RESPONSE_CODE.SUCCESS)
            .json(new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, {}, "Email already verified!"));

    const verifyEmail = await authServices.verifyEmail(userId, token);

    if (!verifyEmail) throw new ApiError(HTTP_RESPONSE_CODE.UNAUTHORIZED, "Link is expired use a newer one");

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, {}, "Email verified"));
}
