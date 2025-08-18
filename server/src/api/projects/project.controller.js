import { ApiError } from "#utils/api.error";
import { ApiResponse } from "#utils/api.response";
import * as projectServices from "#services/project.services";
import { HTTP_RESPONSE_CODE } from "#constants/api.response.codes";
import sqids from "#config/sqids";

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

    project.id = sqids.encode([project.id]);

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
                ...project, // spread the object
                id: sqids.encode([project.id]), // override the original id with encoded id
            })),
        ),
    );
}

export async function getAllProjectCategoriesAndFeatures(req, res) {
    const userId = req.userId;
    const projectId = sqids.decode(req.params.projectId)[0];

    const projectData = await projectServices.getAllProjectCategoriesAndFeatures(projectId, userId);

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, { projectData }));
}
