import { ApiError } from "#utils/api.error";
import { ApiResponse } from "#utils/api.response";
import sqids from "#config/sqids";
import * as projectServices from "#services/project.services";
import { HTTP_RESPONSE_CODE } from "#constants/api.response.codes";

export async function createProject(req, res) {
    // userId is put into the req by the authMiddleware
    const userId = req.userId;
    let { projectName, projectDescription } = req.body;

    // validate input
    if (!projectName) throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Project name can't be empty");
    if (!projectDescription) projectDescription = `${projectName}`;

    const projectAlreadyExists = await projectServices.checkProjectExistsForUser(projectName, userId);
    if (projectAlreadyExists) throw new ApiError(HTTP_RESPONSE_CODE.CONFLICT, "Project with given name already exists");

    // this calls a function which uses transaction to create project then create a project role 'manager' and assign it to user
    const project = await projectServices.createProjectForUser(userId, projectName, projectDescription);
    // project is returned if all queries were successfull
    if (!project) throw new ApiError(HTTP_RESPONSE_CODE.SERVER_ERROR, "Internal server error, project not created");

    res.status(HTTP_RESPONSE_CODE.CREATED).json(
        new ApiResponse(HTTP_RESPONSE_CODE.CREATED, project, "Project created successfuly"),
    );
}

export async function getUserProjects(req, res) {
    const userId = req.userId;

    const projects = await projectServices.getProjectsByUserId(userId);

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
        new ApiResponse(
            HTTP_RESPONSE_CODE.SUCCESS,
            projects.map((project) => ({
                ...project,
            })),
        ),
    );
}

export async function softDeleteUserProject(req, res) {
    const userId = req.userId;
    const { projectUuid } = req.params;

    if (!projectUuid) throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "project uuid not provided");

    await projectServices.softDeleteUserProject(userId, projectUuid);

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS));
}

export async function reverseSoftDeleteUserProject(req, res) {
    const userId = req.userId;
    const { projectUuid } = req.params;

    if (!projectUuid) throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "project uuid not provided");

    await projectServices.reverseSoftDeleteUserProject(userId, projectUuid);

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS));
}

export async function getAllProjectCategoriesAndFeatures(req, res) {
    const userId = req.userId;
    const { projectUuid } = req.params;

    if (!projectUuid) throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "project uuid not provided");

    const projectData = await projectServices.getAllNotDeletedProjectCategoriesAndFeatures(projectUuid, userId);
    if (!projectData) throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "project with given id doesn't exist for user");

    for (let user of projectData.users) {
        user.id = sqids.encode([user.id]);
    }

    for (let category of projectData.categories) {
        for (let feature of category.features) {
            if (feature.details.assigneeId) feature.details.assigneeId = sqids.encode([feature.details.assigneeId]);
        }
    }

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, { projectData }));
}

export async function getAllSoftDeletedProjectNodes(req, res) {
    const userId = req.userId;
    const { projectUuid } = req.params;

    if (!projectUuid) throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Project uuid required to get soft deleted nodes");

    const softDeletedProjectNodes = await projectServices.getAllSoftDeletedProjectNodes(projectUuid);

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
        new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, { softDeletedProjectNodes }, "soft deleted nodes retrieved successfully"),
    );
}
