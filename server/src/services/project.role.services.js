import prisma from "#config/prisma.client";

export async function createProjectRole(roleName, projectUuid) {
    return await prisma.projectRole.create({
        data: {
            projectUuid: projectUuid,
            name: roleName,
        },
    });
}
