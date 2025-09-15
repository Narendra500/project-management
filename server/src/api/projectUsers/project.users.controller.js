import sqids from "#config/sqids";
import { HTTP_RESPONSE_CODE } from "#constants/api.response.codes";
import * as projectUserServices from "#services/project.users.services";
import { ApiError } from "#utils/api.error";
import { ApiResponse } from "#utils/api.response";

export async function getProjectUsers(req, res) {
    const userId = req.userId;
    const { encodedProjectId } = req.params;
    const projectId = encodedProjectId && encodedProjectId !== "null" ? sqids.decode(encodedProjectId)[0] : null;

    const projectUsers = await projectUserServices.getProjectUsers(projectId, userId);

    // there has to be atleast one user returned if user is a member of the project
    if (!projectUsers) throw new ApiError(HTTP_RESPONSE_CODE.FORBIDDEN, "Access denied. You are not a member of this project.");

    for (let user of projectUsers) {
        user.user_id = sqids.encode([user.user_id]);
    }

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
        new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, { projectUsers }, "users retrieved successfully"),
    );
}
