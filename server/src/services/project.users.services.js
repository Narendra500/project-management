import prisma from "#config/prisma.client";

export async function createProjectUserRelation(userId, projectId, roleId) {
    return await prisma.projectUser.create({
        data: {
            userId: userId,
            projectId: projectId,
            roleId: roleId,
        },
    });
}

export async function isUserMemberOfProject(projectId, userId) {
    return await prisma.projectUser.findFirst({
        where: {
            userId: userId,
            projectId: projectId,
        },
    });
}

export async function getProjectUsers(projectId, userId) {
    const userBelongsToProject = await isUserMemberOfProject(projectId, userId);

    if (!userBelongsToProject) return null;

    return await prisma.$queryRaw`
        SELECT u.user_id, u.display_name, pr.project_role_name AS role 
        FROM project_users pu
        INNER JOIN users u ON pu.user_id = u.user_id
        INNER JOIN project_roles pr ON pu.project_role_id = pr.project_role_id
        WHERE pu.project_id = ${projectId}
    `;
}
