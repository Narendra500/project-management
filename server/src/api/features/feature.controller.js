import sqids from "#config/sqids";
import { HTTP_RESPONSE_CODE } from "#constants/api.response.codes";
import { ApiError } from "#utils/api.error";
import { ApiResponse } from "#utils/api.response";
import * as featureServices from "#services/feature.services";
import { isUserMemberOfProject } from "#services/project.users.services";
import { getCategoryByUuid, getCategoryProjectUuid } from "#services/category.services";
import { getIO } from "#socket/index";
import { SOCKET_IO_EVENTS } from "#constants/socketio.events";
import logger from "#utils/logger";

export async function createFeature(req, res) {
    const userId = req.userId;
    const { name, gitBranch, assignee, dueDate, description, acceptanceCriteria, parentUuid, categoryUuid } = req.body;

    if (!name || !categoryUuid)
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Required fields for feature creation not provided");

    const [assigneeId] = (assignee && sqids.decode(assignee)) || [null];

    const projectUuid = await getCategoryProjectUuid(categoryUuid);
    if (!projectUuid) {
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Category doesn't exist");
    }
    const user = await isUserMemberOfProject(projectUuid, userId);
    if (!user) {
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "User isn't part of the project");
    }

    const alreadyExists = await featureServices.checkFeatureExistsForCategory(name, categoryUuid);
    if (alreadyExists)
        throw new ApiError(HTTP_RESPONSE_CODE.CONFLICT, "Feature with this name already exists in the given category");

    const [feature, project] = await featureServices.createFeature(
        name,
        gitBranch,
        assigneeId,
        dueDate,
        description,
        acceptanceCriteria,
        categoryUuid,
        parentUuid,
        projectUuid,
    );

    try {
        const io = getIO();
        io.to(projectUuid).emit(SOCKET_IO_EVENTS.FEATURE_ADDED, {
            projectUuid: projectUuid,
            categoryUuid: feature.categoryUuid,
            featureParentUuid: feature.parentUuid,
            featureName: feature.name,
            featureUuid: feature.uuid,
            projectVersion: project.projectVersion,
        });
    } catch (err) {
        logger.error({ message: "Failed to emit featureCreated socket event", error: err });
    }

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
    const { featureUuid } = req.params;

    if (!featureUuid) throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "featureUuid not provided");

    const feature = await featureServices.getFeatureDetailsById(featureUuid);
    if (!feature) {
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Feature with given id doesnt exist");
    }
    const userBelongsToProject = await isUserMemberOfProject(feature.category.projectUuid, userId);
    if (!userBelongsToProject)
        throw new ApiError(HTTP_RESPONSE_CODE.FORBIDDEN, "You can't access this feature as you are not a part of this project");

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
        new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, {
            uuid: feature.uuid,
            projectUuid: feature.category.projectUuid,
            categoryUuid: feature.categoryUuid,
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

export async function updateFeatureDetails(req, res) {
    const userId = req.userId;
    const { featureUuid, updatedFeatureDetails } = req.body;

    if (!featureUuid || !updatedFeatureDetails)
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "feature details not provided");

    [updatedFeatureDetails.assigneeId] =
        updatedFeatureDetails.assigneeId != null ? sqids.decode(updatedFeatureDetails.assigneeId) : null;
    updatedFeatureDetails.dueDate = updatedFeatureDetails.dueDate ? new Date(updatedFeatureDetails.dueDate).toISOString() : null;

    const feature = await featureServices.getFeatureDetailsById(featureUuid);
    const userBelongsToProject = await isUserMemberOfProject(feature.category.projectUuid, userId);
    if (!userBelongsToProject)
        throw new ApiError(HTTP_RESPONSE_CODE.FORBIDDEN, "You can't access this feature as you are not a part of this project");

    const [updatedFeature, updatedDBFeatureDetails, updatedProject] = await featureServices.updateFeatureDetailsById(
        feature.uuid,
        feature.category.projectUuid,
        updatedFeatureDetails,
    );

    // If assignee exists, encode their ID for the client
    if (updatedDBFeatureDetails.assignee?.id) {
        updatedDBFeatureDetails.assignee.id = sqids.encode([updatedDBFeatureDeatils.assignee.id]);
    }

    // Emit the socket event to all clients in the project room
    try {
        const io = getIO();
        io.to(projectUuid).emit(SOCKET_IO_EVENTS.FEATURE_UPDATED, {
            featureUuid,
            featureName: updatedFeature.name,
            featureDescription: updatedDBFeatureDetails.description,
            assignee: updatedDBFeatureDetails.assignee,
            gitBranch: updatedDBFeatureDetails.gitBranch,
            dueDate: updatedDBFeatureDetails.dueDate,
            status: updatedDBFeatureDetails.status,
            acceptanceCriteria: updatedDBFeatureDetails.acceptanceCriteria,
            projectVersion: updatedProject.projectVersion,
        });
    } catch (err) {
        logger.error({ message: "Failed to emit featureUpdated socket event", error: err });
    }

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
        new ApiResponse(HTTP_RESPONSE_CODE.SUCCESS, {
            name: updatedFeature.name,
            description: updatedDBFeatureDetails.description,
            assignee: updatedDBFeatureDetails.assignee,
            gitBranch: updatedDBFeatureDetails.gitBranch,
            dueDate: updatedDBFeatureDetails.dueDate,
            status: updatedDBFeatureDetails.status,
            acceptanceCriteria: updatedDBFeatureDetails.acceptanceCriteria,
        }),
        "feature details updated successfully",
    );
}
