import prisma from "#config/prisma.client";
import { Prisma } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";

export async function createProjectUserRelation(userId, projectUuid, roleId) {
    return await prisma.projectUser.create({
        data: {
            userId: userId,
            projectUuid: projectUuid,
            roleId: roleId,
        },
    });
}

export async function isUserMemberOfProject(projectUuid, userId) {
    return await prisma.projectUser.findFirst({
        where: {
            userId: userId,
            projectUuid: projectUuid,
        },
    });
}

export async function createProjectInvite(projectUuid, expiresAt) {
    return await prisma.projectInvite.create({
        data: {
            projectUuid: projectUuid,
            inviteCode: createId(),
            expiresAt: expiresAt,
        },
    });
}

export async function getProjectUsersByEmails(projectUuid, userEmails) {
    return await prisma.$queryRaw`
        SELECT u.user_id, u.display_name, u.user_name as email
        FROM project_users pu
        INNER JOIN users u ON pu.user_id = u.user_id
        WHERE pu.project_uuid = ${projectUuid} AND u.user_name IN (${Prisma.join(userEmails, ",")})
    `;
}

export async function getProjectUser(projectUuid, requesterUserId, queriedUserId) {
    const userBelongsToProject = await isUserMemberOfProject(projectUuid, requesterUserId);

    if (!userBelongsToProject) return null;

    // Returns an array of users, but in this case we have only requested one user so we return the first element of the array.
    const user_array = await prisma.$queryRaw`
        SELECT u.user_id, u.display_name, pr.project_role_name AS role 
        FROM project_users pu 
        INNER JOIN users u ON pu.user_id = u.user_id
        INNER JOIN project_roles pr ON pu.project_role_id = pr.project_role_id
        WHERE pu.project_uuid = ${projectUuid} AND u.user_id = ${queriedUserId}
    `;

    return user_array[0];
}

export async function getProjectUsers(projectUuid, userId) {
    const userBelongsToProject = await isUserMemberOfProject(projectUuid, userId);

    if (!userBelongsToProject) return null;

    return await prisma.$queryRaw`
        SELECT u.user_id, u.display_name, u.user_name as email, pr.project_role_name AS role 
        FROM project_users pu
        INNER JOIN users u ON pu.user_id = u.user_id
        INNER JOIN project_roles pr ON pu.project_role_id = pr.project_role_id
        WHERE pu.project_uuid = ${projectUuid}
    `;
}
