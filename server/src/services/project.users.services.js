import prisma from "#config/prisma.client";

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

export async function getProjectUsers(projectUuid, userId) {
    const userBelongsToProject = await isUserMemberOfProject(projectUuid, userId);

    if (!userBelongsToProject) return null;

    return await prisma.$queryRaw`
        SELECT u.user_id, u.display_name, pr.project_role_name AS role 
        FROM project_users pu
        INNER JOIN users u ON pu.user_id = u.user_id
        INNER JOIN project_roles pr ON pu.project_role_id = pr.project_role_id
        WHERE pu.project_uuid = ${projectUuid}
    `;
}
