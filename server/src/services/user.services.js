import prisma from "#config/prisma.client";

export async function updateUserActiveProject(userId, projectUuid) {
    return await prisma.$transaction(async (tx) => {
        // check if user is part of the project
        // no need to check is project is being set as inactive., therefore null
        if (projectUuid) {
            const userProject = await tx.project.findUnique({
                where: {
                    uuid: projectUuid,
                    projectUsers: {
                        some: {
                            userId: userId,
                        },
                    },
                },
            });

            // return null to signify failure to update as user isn't part of the project
            if (!userProject) null;
        }

        const user = await tx.user.update({
            where: {
                id: userId,
            },
            data: {
                activeProjectUuid: projectUuid,
            },
        });

        return user;
    });
}

export async function updateUserDisplayName(userId, newDisplayName) {
    return await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            displayName: newDisplayName,
        },
    });
}

export async function getUserById(userId) {
    return await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
}

export async function getUserVerificationStatus(userId) {
    // return verification status
    return await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
}
