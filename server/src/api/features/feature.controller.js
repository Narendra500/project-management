import sqids from "#config/sqids";
import { HTTP_RESPONSE_CODE } from "#constants/api.response.codes";
import { ApiError } from "#utils/api.error";
import { ApiResponse } from "#utils/api.response";
import * as featureServices from "#services/feature.services";
import { isUserMemberOfProject } from "#services/project.users.services";
import { getCategoryByUuid } from "#services/category.services";

export async function createFeature(req, res) {
    const { name, gitBranch, assignee, dueDate, description, acceptanceCriteria, parentUuid, categoryUuid } = req.body;

    if (!name || !categoryUuid)
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Required fields for feature creation not provided");

    const [assigneeId] = (assignee && sqids.decode(assignee)) || [null];

    const alreadyExists = await featureServices.checkFeatureExistsForCategory(name, categoryUuid);
    if (alreadyExists)
        throw new ApiError(HTTP_RESPONSE_CODE.CONFLICT, "Feature with this name already exists in the given category");

    const feature = await featureServices.createFeature(
        name,
        gitBranch,
        assigneeId,
        dueDate,
        description,
        acceptanceCriteria,
        categoryUuid,
        parentUuid,
    );

    res.status(HTTP_RESPONSE_CODE.CREATED).json(
        new ApiResponse(HTTP_RESPONSE_CODE.CREATED, {
            featureName: feature.name,
            featureUuid: feature.uuid,
            categoryUuid: feature.categoryUuid,
        }),
    );
}

export async function getFeatureDetails(req, res) {
    const userId = req.userId;
    const { projectUuid, categoryUuid, featureUuid } = req.params;

    if (!projectUuid || !categoryUuid || !featureUuid)
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "projectUuid and (or) categoryUuid and (or) featureUuid not provided");

    const userBelongsToProject = await isUserMemberOfProject(projectUuid, userId);
    if (!userBelongsToProject)
        throw new ApiError(HTTP_RESPONSE_CODE.FORBIDDEN, "You can't access this feature as you are not a part of this project");

    const categoryExists = await getCategoryByUuid(projectUuid, categoryUuid);
    if (!categoryExists) throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Invalid categoryId provided");

    const feature = await featureServices.getFeatureDetailsById(featureUuid, categoryUuid);

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
        new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, {
            name: feature.name,
            description: feature.featureDetails.description,
            assignee: feature.featureDetails.assignee,
            gitBranch: feature.featureDetails.gitBranch,
            dueDate: feature.featureDetails.dueDate,
            status: feature.featureDetails.status,
            acceptanceCriteria: feature.featureDetails.acceptanceCriteria,
        }),
        "feature details retrieved successfully",
    );
}

export async function updateFeatureDetails(req, res) {
    const userId = req.userId;
    const { projectUuid, categoryUuid, featureUuid, updatedFeatureDetails } = req.body;

    if (!projectUuid || !categoryUuid || !featureUuid || !updatedFeatureDetails)
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "projectUuid and (or) categoryUuid and (or) featureUuid not provided");

    const userBelongsToProject = await isUserMemberOfProject(projectUuid, userId);
    if (!userBelongsToProject)
        throw new ApiError(HTTP_RESPONSE_CODE.FORBIDDEN, "You can't access this feature as you are not a part of this project");

    const categoryExists = await getCategoryByUuid(projectUuid, categoryUuid);
    if (!categoryExists) throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Invalid categoryId provided");

    if (updatedFeatureDetails.assigneeId) [updatedFeatureDetails.assigneeId] = sqids.decode(updatedFeatureDetails.assigneeId);
    if (updatedFeatureDetails.dueDate) updatedFeatureDetails.dueDate = new Date(updatedFeatureDetails.dueDate).toISOString();
    const feature = await featureServices.updateFeatureDetailsById(featureUuid, categoryUuid, updatedFeatureDetails);

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
        new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, {
            description: feature.description,
            assignee: feature.assignee,
            gitBranch: feature.gitBranch,
            dueDate: feature.dueDate,
            status: feature.status,
            acceptanceCriteria: feature.acceptanceCriteria,
        }),
        "feature details updated successfully",
    );
}
