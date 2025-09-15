import prisma from "#config/prisma.client";

export async function checkFeatureExistsForCategory(featureName, categoryId) {
    const featureExists = await prisma.feature.findFirst({
        where: {
            name: featureName,
            categoryId: categoryId,
        },
    });

    return !!featureExists;
}

export async function createFeature(
    featureName,
    featureGitBranch,
    featureAssigneeId,
    featureDueDate,
    featureDescription,
    featureAcceptanceCriteria,
    categoryId,
    featureParentId,
) {
    return await prisma.$transaction(async (tx) => {
        const feature = await tx.feature.create({
            data: {
                name: featureName,
                categoryId: categoryId,
                parentId: featureParentId,
            },
        });

        await tx.featureDetail.create({
            data: {
                featureId: feature.id,
                description: featureDescription,
                gitBranch: featureGitBranch,
                assigneeId: featureAssigneeId || null,
                dueDate: featureDueDate || null,
                acceptanceCriteria: featureAcceptanceCriteria,
            },
        });

        return feature;
    });
}

export async function getFeatureDetailsById(featureId, categoryId) {
    return await prisma.feature.findUnique({
        where: {
            featureId: featureId,
            categoryId: categoryId,
        },
        include: {
            featureDetails: {
                select: {
                    description: true,
                    gitBranch: true,
                    assignee: true,
                    dueDate: true,
                    status: true,
                    acceptanceCriteria: true,
                },
            },
        },
    });
}
