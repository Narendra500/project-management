import sqids from "#config/sqids";
import { HTTP_RESPONSE_CODE } from "#constants/api.response.codes";
import * as featureDetailServices from "#services/feature.details.services";
import { ApiError } from "#utils/api.error";
import { ApiResponse } from "#utils/api.response";
import { FeatureStatus } from "@prisma/client";
import { FeaturePriority } from "@prisma/client";
import { isUserMemberOfProject } from "#services/project.users.services";
import { getCategoryByUuid } from "#services/category.services";

export async function updateFeatureDetails(req, res) {
    const { featureUuid } = req.params;
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

    await featureDetailServices.updateFeatureDetails(featureUuid, updateData);

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
        new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, {}, "Feature deatils updated successfuly"),
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

    const feature = await featureDetailServices.getFeatureDetailsById(featureUuid, categoryUuid);

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
        new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, {
            name: feature.name,
            description: feature.details.description,
            assignee: feature.details.assignee,
            gitBranch: feature.details.gitBranch,
            dueDate: feature.details.dueDate,
            status: feature.details.status,
            acceptanceCriteria: feature.details.acceptanceCriteria,
        }),
        "feature details retrieved successfully",
    );
}
