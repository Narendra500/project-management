import prisma from "#config/prisma.client";

export async function updateFeatureDetails(featureId, updateData) {
    await prisma.featureDetail.update({
        where: {
            featureId: featureId,
        },
        data: updateData,
    });
}

export async function getFeatureDetailsById(featureId, categoryId) {
    return await prisma.feature.findUnique({
        where: {
            id: featureId,
            categoryId: categoryId,
        },
        include: {
            featureDetails: {
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
