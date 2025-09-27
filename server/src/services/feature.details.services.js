import prisma from "#config/prisma.client";

export async function updateFeatureDetails(featureUuid, updateData) {
    await prisma.featureDetail.update({
        where: {
            featureUuid: featureUuid,
        },
        data: updateData,
    });
}

export async function getFeatureDetailsById(featureUuid, categoryUuid) {
    return await prisma.feature.findUnique({
        where: {
            uuid: featureUuid,
            categoryUuid: categoryUuid,
        },
        include: {
            details: {
                select: {
                    description: true,
                    gitBranch: true,
                    assignee: {
                        select: {
                            displayName: true,
                        },
                    },
                    dueDate: true,
                    status: true,
                    acceptanceCriteria: true,
                },
            },
        },
    });
}
