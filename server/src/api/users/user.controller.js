import { HTTP_RESPONSE_CODE } from "#constants/api.response.codes";
import * as userServices from "#services/user.services";
import { ApiError } from "#utils/api.error";
import { ApiResponse } from "#utils/api.response";
import sqids from "#config/sqids";

export async function updateUserDisplayName(req, res) {
    const userId = req.userId;
    let { newDisplayName: rawNewDisplayName } = req.body;

    const newDisplayName = rawNewDisplayName
        .trim() // remove leading/trailing spaces
        .split(" ") // split at blank spaces
        .filter((str) => str) // returns an array of non empty strings
        .join(" "); // join all words with single space

    const user = await userServices.updateUserDisplayName(userId, newDisplayName);

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
        new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, { displayName: user.displayName }, "Display Name updated successfuly"),
    );
}

export async function getUserDetails(req, res) {
    const userId = req.userId;

    const user = await userServices.getUserById(userId);
    if (!user) throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "User with given id doesn't exist");

    if (user.activeProjectId !== null) {
        user.activeProjectId = sqids.encode([user.activeProjectId]);
    }

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
        new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, {
            displayName: user.displayName,
            isVerified: user.isVerified,
            activeProjectId: user.activeProjectId,
        }),
    );
}

export async function updateUserActiveProject(req, res) {
    const userId = req.userId;
    let { projectId } = req.body;
    if (projectId) [projectId] = sqids.decode(projectId);

    const newActiveproject = await userServices.updateUserActiveProject(userId, projectId);
    if (!newActiveproject) throw new ApiError(HTTP_RESPONSE_CODE.UNAUTHORIZED, "User not authorized to access this project");

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
        new ApiResponse(
            HTTP_RESPONSE_CODE.SUCCESS,
            { activeProjectId: sqids.encode([newActiveproject]) },
            "User active project updated",
        ),
    );
}
