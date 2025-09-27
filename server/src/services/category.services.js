import prisma from "#config/prisma.client";
import { createId } from "@paralleldrive/cuid2";

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

// prettier-ignore
export async function createCategory(projectUuid, categoryName, categoryDescription, categoryColor, categoryParentUuid) {
    return await prisma.category.create({
        data: {
            uuid: createId(),
            projectUuid: projectUuid,
            name: categoryName,
            description: categoryDescription,
            color: categoryColor,
            parentUuid: categoryParentUuid
        }
    })
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
