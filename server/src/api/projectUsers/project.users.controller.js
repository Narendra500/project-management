import sqids from "#config/sqids";
import { HTTP_RESPONSE_CODE } from "#constants/api.response.codes";
import * as projectUserServices from "#services/project.users.services";
import { getProjectDetails } from "#services/project.services";
import { ApiError } from "#utils/api.error";
import { ApiResponse } from "#utils/api.response";

export async function getProjectUsers(req, res) {
    const userId = req.userId;
    const { projectUuid } = req.params;

    const projectUsers = await projectUserServices.getProjectUsers(projectUuid, userId);

    // there has to be atleast one user returned if user is a member of the project
    if (!projectUsers) throw new ApiError(HTTP_RESPONSE_CODE.FORBIDDEN, "Access denied. You are not a member of this project.");

    for (let user of projectUsers) {
        user.user_id = sqids.encode([user.user_id]);
    }

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
        new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, { projectUsers }, "users retrieved successfully"),
    );
}

export async function inviteUsers(req, res) {
    const userId = req.userId;
    const { projectUuid, userEmails } = req.params;

    if (!projectUuid) throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Project uuid not provided");

    const user = await projectUserServices.getProjectUser(projectUuid, userId, userId);
    if (!user) throw new ApiError(HTTP_RESPONSE_CODE.FORBIDDEN, "Access denied, You are not a member of this project.");

    const expiresAt = new Date(Date.now() * 1000 * 60 * 60 * 24);

    const projectInvite = await projectUserServices.createProjectInvite(projectUuid, expiresAt);
    if (!projectInvite) throw new ApiError(HTTP_RESPONSE_CODE.SERVER_ERROR, "Server error");

    const projectDetails = await getProjectDetails(projectUuid);
    if (!projectDetails) throw new ApiError(HTTP_RESPONSE_CODE.SERVER_ERROR, "Server error");

    const projectInviteLink = `http://localhost:5173/join-project/${projectInvite.inviteCode}`;

    const emailStatus = await sendEmail({
        to: user.name,
        subject: `Invitation to join orbit project ${projectDetails.name} by ${user.displayName}`,
        html: `
      <h1>You have been invited to join the orbit project ${projectDetails.name} by ${user.displayName}</h1>
      <p>Please click the link below to join if you intend to, else ignore the email</p>
      <a href="${projectInviteLink}">Join Project</a>
      <p>The above link is only valid for 24 hours</p>
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
