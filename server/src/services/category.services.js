import prisma from "#config/prisma.client";

export async function checkCategoryExists(categoryName, projectId) {
    const existingCategory = await prisma.category.findFirst({
        where: {
            name: categoryName,
            projectId: projectId,
        },
    });

    return !!existingCategory;
}

export async function checkSubCategoryExists(categoryName, categoryParentId) {
    const existingCategory = await prisma.category.findFirst({
        where: {
            name: categoryName,
            parentId: categoryParentId,
        },
    });

    return !!existingCategory;
}

// prettier-ignore
export async function createCategory(projectId, categoryName, categoryDescription, categoryColor, categoryParentId) {
    return await prisma.category.create({
        data: {
            projectId: projectId,
            name: categoryName,
            description: categoryDescription,
            color: categoryColor,
            parentId: categoryParentId
        }
    })
}

export async function canUserCreateCategory(userId, projectId) {
    return await prisma.$transaction(async (tx) => {
        const userProjectRelation = await tx.projectUser.findUnique({
            where: {
                // findUnique using compound keys
                userId_projectId: {
                    userId: userId,
                    projectId: projectId,
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

export async function getCategoryById(projectId, categoryId) {
    return prisma.category.findUnique({
        where: {
            id: categoryId,
            projectId: projectId,
        },
    });
}
