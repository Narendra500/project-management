import sqids from "#config/sqids";
import { HTTP_RESPONSE_CODE } from "#constants/api.response.codes";
import * as featureDetailServices from "#services/feature.details.services";
import { ApiError } from "#utils/api.error";
import { ApiResponse } from "#utils/api.response";
import { FeatureStatus } from "@prisma/client";
import { FeaturePriority } from "@prisma/client";
import { isUserMemberOfProject } from "#services/project.users.services";
import { getCategoryById } from "#services/category.services";

export async function updateFeatureDetails(req, res) {
    const { encodedFeatureId } = req.params;
    const updateData = req.body;

    if (updateData.status && !(updateData.status in FeatureStatus)) {
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Invalid feature status are the only valid statuses available", {
            validStatuses: Object.keys(FeatureStatus),
        });
    }
    if (updateData.priority && !(updateData.priority in FeaturePriority)) {
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Invalid feature status are the only valid priorities available", {
            validPriorities: Object.keys(FeaturePriority),
        });
    }

    const [featureId] = sqids.decode(encodedFeatureId);

    await featureDetailServices.updateFeatureDetails(featureId, updateData);

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
        new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, {}, "Feature deatils updated successfuly"),
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

    const feature = await featureDetailServices.getFeatureDetailsById(featureId, categoryId);

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
