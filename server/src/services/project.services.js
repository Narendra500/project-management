import prisma from "#config/prisma.client";

export async function getAllProjectCategoriesAndFeatures(projectId, userId) {
    return await prisma.project.findUnique({
        where: {
            id: projectId,
            projectUsers: {
                some: {
                    userId: userId,
                },
            },
        },
        select: {
            id: true,
            name: true,
            categories: {
                select: {
                    id: true,
                    name: true,
                    color: true,
                    parentId: true,
                    features: {
                        select: {
                            id: true,
                            name: true,
                            parentId: true,
                            categoryId: true,
                        },
                    },
                },
            },
        },
    });
}

export async function checkProjectExistsForUser(projectName, userId) {
    const existingProject = await prisma.project.findFirst({
        where: {
            // match projects with given name
            name: projectName,
            // if any project is related to the given userId then match it.
            projectUsers: {
                some: {
                    userId: userId,
                },
            },
        },
    });

    // first ! converts object to boolean and negates it, second ! negates it to get correct truthy / falsy value.
    return !!existingProject;
}

// creates a project, creates a manager role for the project, assigns the manager role to the creater
export async function createProjectForUser(createrUserId, projectName, projectDescription) {
    // start an interactive transaction by passing a function to $transaction
    return await prisma.$transaction(async (tx) => {
        const project = await tx.project.create({
            data: {
                name: projectName,
                description: projectDescription,
            },
        });

        const managerRole = await tx.projectRole.create({
            data: {
                name: "Manager",
                projectId: project.id, // use the id from the project created by above query
                deletePermission: true,
                writePermission: true,
            },
        });

        await tx.projectUser.create({
            data: {
                userId: createrUserId,
                projectId: project.id,
                roleId: managerRole.id, // assign manager role to the creator of the project
            },
        });

        // add the role field to the response
        project.role = managerRole.name;

        return project;
    });
}

export async function getProjectsByUserId(userId) {
    // get all projects and project roles related to the projectUsers table where userId is equal to the user id provided
    const memberships = await prisma.projectUser.findMany({
        where: {
            userId: userId,
        },
        include: {
            project: true, // Include the full project object
            projectRoles: true, // Include the full role object
        },
    });

    // example output
    // [
    //   { userId: 1, projectId: 101, roleId: 1, project: { ... }, projectRoles: { name: 'Manager', ... } },
    //   { userId: 1, projectId: 102, roleId: 5, project: { ... }, projectRoles: { name: 'Member', ... } }
    // ]

    const projectsWithRoles = memberships.map((membership) => ({
        // Spread all the project details (id, name, description, etc.)
        ...membership.project,
        // Add a 'role' property with the role name
        role: membership.projectRoles.name,
    }));

    return projectsWithRoles;
}
