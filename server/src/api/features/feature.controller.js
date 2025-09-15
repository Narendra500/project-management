import sqids from "#config/sqids";
import { HTTP_RESPONSE_CODE } from "#constants/api.response.codes";
import { ApiError } from "#utils/api.error";
import { ApiResponse } from "#utils/api.response";
import * as featureServices from "#services/feature.services";
import { isUserMemberOfProject } from "#services/project.users.services";
import { getCategoryById } from "#services/category.services";

export async function createFeature(req, res) {
    const {
        featureName,
        featureGitBranch,
        featureAssignee,
        featureDueDate,
        featureDescription,
        featureAcceptanceCriteria,
        encodedFeatureParentId,
        encodedCategoryId,
    } = req.body;

    if (!featureName || !encodedCategoryId)
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Required fields for feature creation not provided");

    const [categoryId] = sqids.decode(encodedCategoryId);
    const [featureAssigneeId] = sqids.decode(featureAssignee);
    const [featureParentId] = encodedFeatureParentId ? sqids.decode(encodedFeatureParentId) : [null];

    const alreadyExists = await featureServices.checkFeatureExistsForCategory(featureName, categoryId);
    if (alreadyExists)
        throw new ApiError(HTTP_RESPONSE_CODE.CONFLICT, "Feature with this name already exists in the given category");

    const feature = await featureServices.createFeature(
        featureName,
        featureGitBranch,
        featureAssigneeId,
        featureDueDate,
        featureDescription,
        featureAcceptanceCriteria,
        categoryId,
        featureParentId,
    );

    res.status(HTTP_RESPONSE_CODE.CREATED).json(
        new ApiResponse(HTTP_RESPONSE_CODE.CREATED, {
            featureName: feature.name,
            featureId: sqids.encode([feature.id]),
            categoryId: sqids.encode([feature.categoryId]),
        }),
    );
}

export async function getFeatureDetails(req, res) {
    const userId = req.userId;
    const { encodedProjectId, encodedCategoryId, encodedFeatureId } = req.params;

    if (!encodedProjectId || !encodedCategoryId || !encodedFeatureId)
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "projectId and (or) categoryId and (or) featureId not provided");

    const [projectId] = sqids.decode(encodedProjectId);
    const [categoryId] = sqids.decode(encodedCategoryId);
    const [featureId] = sqids.decode(encodedFeatureId);

    const userBelongsToProject = await isUserMemberOfProject(projectId, userId);
    if (!userBelongsToProject)
        throw new ApiError(HTTP_RESPONSE_CODE.FORBIDDEN, "You can't access this feature as you are not a part of this project");

    const categoryExists = await getCategoryById(projectId, categoryId);
    if (!categoryExists) throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Invalid categoryId provided");

    const feature = await featureServices.getFeatureDetailsById(featureId, categoryId);

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
