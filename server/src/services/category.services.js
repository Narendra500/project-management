import prisma from "#config/prisma.client";
import { createId } from "@paralleldrive/cuid2";

async function forceColorUpdate(tx, parentUuid, newColor, updatedIds = []) {
    const subCategories = await tx.category.findMany({
        where: { parentUuid: parentUuid, isDeleted: false },
    });

    for (const sub of subCategories) {
        await tx.category.update({
            where: { uuid: sub.uuid },
            data: { color: newColor },
        });
        updatedIds.push(sub.uuid);
        await forceColorUpdate(tx, sub.uuid, newColor, updatedIds);
    }
    return updatedIds;
}

async function normalColorUpdate(tx, parentUuid, originalColor, newColor, updatedIds = []) {
    const subCategories = await tx.category.findMany({
        where: {
            parentUuid: parentUuid,
            color: originalColor,
            isDeleted: false,
        },
    });

    for (const sub of subCategories) {
        await tx.category.update({
            where: { uuid: sub.uuid },
            data: { color: newColor },
        });
        updatedIds.push(sub.uuid);
        await normalColorUpdate(tx, sub.uuid, originalColor, newColor, updatedIds);
    }
    return updatedIds;
}

export async function updateCategoryDetails(categoryDetails, colorMode = "normal") {
    return await prisma.$transaction(async (tx) => {
        const originalCategory = await tx.category.findUnique({
            where: { uuid: categoryDetails.uuid },
        });

        if (!originalCategory) {
            throw new Error("Category not found");
        }

        const updatedCategory = await tx.category.update({
            where: {
                uuid: categoryDetails.uuid,
            },
            data: {
                name: categoryDetails.name,
                description: categoryDetails.description,
                color: categoryDetails.color,
            },
        });

        const project = await tx.project.update({
            where: {
                uuid: categoryDetails.projectUuid,
            },
            data: {
                projectVersion: { increment: 1 },
            },
        });

        let updatedSubCategoryUuids = [];
        if (colorMode === "force") {
            updatedSubCategoryUuids = await forceColorUpdate(tx, categoryDetails.uuid, categoryDetails.color);
        } else if (originalCategory.color !== categoryDetails.color) {
            updatedSubCategoryUuids = await normalColorUpdate(tx, categoryDetails.uuid, originalCategory.color, categoryDetails.color);
        }

        return [updatedCategory, project, updatedSubCategoryUuids];
    });
}

export async function getCategoryProjectUuid(categoryUuid) {
    const category = await prisma.category.findUnique({
        select: {
            projectUuid: true,
        },
        where: {
            uuid: categoryUuid,
        },
    });
    return category.projectUuid;
}

export async function checkCategoryExists(categoryName, projectUuid) {
    const existingCategory = await prisma.category.findFirst({
        where: {
            name: categoryName,
            projectUuid: projectUuid,
        },
    });

    return !!existingCategory;
}

export async function checkSubCategoryExists(categoryName, categoryParentUuid) {
    const existingCategory = await prisma.category.findFirst({
        where: {
            name: categoryName,
            projectUuid: categoryParentUuid,
        },
    });

    return !!existingCategory;
}

export async function createCategory(projectUuid, categoryName, categoryDescription, categoryColor, categoryParentUuid) {
    return await prisma.$transaction([
        prisma.category.create({
            data: {
                uuid: createId(),
                projectUuid: projectUuid,
                name: categoryName,
                description: categoryDescription,
                color: categoryColor,
                parentUuid: categoryParentUuid,
            },
        }),
        prisma.project.update({
            where: {
                uuid: projectUuid,
            },
            data: {
                projectVersion: { increment: 1 },
            },
        }),
    ]);
}

export async function canUserCreateCategory(userId, projectUuid) {
    return await prisma.$transaction(async (tx) => {
        const userProjectRelation = await tx.projectUser.findUnique({
            where: {
                // findUnique using compound keys
                userId_projectUuid: {
                    userId: userId,
                    projectUuid: projectUuid,
                },
            },
        });

        if (!userProjectRelation) return false;

        const userRole = await tx.projectRole.findUnique({
            where: {
                id: userProjectRelation.roleId,
            },
        });

        if (!userRole.writePermission) return false;

        return true;
    });
}

export async function getCategoryByUuid(projectUuid, categoryUuid) {
    return prisma.category.findUnique({
        where: {
            uuid: categoryUuid,
            projectUuid: projectUuid,
        },
    });
}
