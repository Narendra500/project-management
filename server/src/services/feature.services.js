import { FeatureStatus } from "@prisma/client";
import prisma from "#config/prisma.client";

export async function checkFeatureExistsForCategory(featureName, categoryUuid) {
    const featureExists = await prisma.feature.findFirst({
        where: {
            name: featureName,
            categoryUuid: categoryUuid,
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
    categoryUuid,
    featureParentUuid,
) {
    return await prisma.$transaction(async (tx) => {
        const feature = await tx.feature.create({
            data: {
                name: featureName,
                categoryUuid: categoryUuid,
                parentUuid: featureParentUuid,
            },
        });

        await tx.featureDetail.create({
            data: {
                featureUuid: feature.uuid,
                status: FeatureStatus.open,
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

export async function getFeatureDetailsById(featureUuid, categoryUuid) {
    return await prisma.feature.findUnique({
        where: {
            uuid: featureUuid,
            categoryUuid: categoryUuid,
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
