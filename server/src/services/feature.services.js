import { FeatureStatus } from "@prisma/client";
import prisma from "#config/prisma.client";
import { createId } from "@paralleldrive/cuid2";

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
    projectUuid,
) {
    return await prisma.$transaction(async (tx) => {
        const feature = await tx.feature.create({
            data: {
                uuid: createId(),
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

        const project = await tx.project.update({
            where: {
                uuid: projectUuid,
            },
            data: { projectVersion: { increment: 1 } },
        });

        return [feature, project];
    });
}

export async function updateFeatureDetailsById(featureUuid, projectUuid, updatedFeatureDetails) {
    // remove name field from updatedFeatureDetails object as only features table has it.
    const { name, ...cleanUpdatedFeatureDetails } = updatedFeatureDetails;
    return await prisma.$transaction([
        prisma.feature.update({
            where: {
                uuid: featureUuid,
            },
            data: { name: name },
        }),
        prisma.featureDetail.update({
            where: {
                featureUuid: featureUuid,
            },
            data: cleanUpdatedFeatureDetails,
            include: {
                assignee: {
                    select: { id: true, displayName: true },
                },
            },
        }),
        prisma.project.update({
            where: {
                uuid: projectUuid,
            },
            data: { projectVersion: { increment: 1 } },
        }),
    ]);
}

export async function getFeatureDetailsById(featureUuid) {
    return await prisma.feature.findUnique({
        where: {
            uuid: featureUuid,
        },
        include: {
            details: {
                select: {
                    description: true,
                    gitBranch: true,
                    assignee: true,
                    dueDate: true,
                    status: true,
                    acceptanceCriteria: true,
                },
            },
            category: { select: { projectUuid: true } },
        },
    });
}
