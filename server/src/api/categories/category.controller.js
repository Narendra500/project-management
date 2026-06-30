import { HTTP_RESPONSE_CODE } from "#constants/api.response.codes";
import { isUserMemberOfProject } from "#services/project.users.services";
import * as categoryServices from "#services/category.services";
import { ApiError } from "#utils/api.error";
import { ApiResponse } from "#utils/api.response";
import { getIO } from "#socket/index";
import { SOCKET_IO_EVENTS } from "#constants/socketio.events";
import logger from "#utils/logger";

export async function createCategory(req, res) {
    const userId = req.userId;
    const { projectUuid, categoryName, categoryColor } = req.body;
    let { categoryDescription, categoryParentUuid } = req.body;

    categoryDescription = categoryDescription || "";
    categoryParentUuid = categoryParentUuid || null;

    if (!projectUuid || !categoryName || !categoryColor)
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "required fields not provided for category");

    // check if user is authorized to perform this action
    const userAuthorized = await categoryServices.canUserCreateCategory(userId, projectUuid);

    if (!userAuthorized)
        throw new ApiError(
            HTTP_RESPONSE_CODE.UNAUTHORIZED,
            "not authorized to perform this action, check if you have writePermission for the project",
        );

    if (categoryParentUuid) {
        const subCategoryAlreadyExists = await categoryServices.checkSubCategoryExists(categoryName, categoryParentUuid);
        if (subCategoryAlreadyExists)
            throw new ApiError(HTTP_RESPONSE_CODE.CONFLICT, "Sub Category already exists in the given category");
    } else {
        const categoryAlreadyExists = await categoryServices.checkCategoryExists(categoryName, projectUuid);
        if (categoryAlreadyExists) throw new ApiError(HTTP_RESPONSE_CODE.CONFLICT, "Category already exists in the project");
    }

    const [category, project] = await categoryServices.createCategory(
        projectUuid,
        categoryName,
        categoryDescription,
        categoryColor,
        categoryParentUuid,
    );

    try {
        const io = getIO();
        io.to(projectUuid).emit(SOCKET_IO_EVENTS.CATEGORY_ADDED, {
            projectUuid: category.projectUuid,
            categoryUuid: category.uuid,
            categoryName: category.name,
            categoryColor: category.color,
            categoryParentUuid: category.parentUuid,
            projectVersion: project.projectVersion,
        });
    } catch (err) {
        logger.error({ message: "Failed to emit categoryCreated socket event", error: err });
    }

    res.status(HTTP_RESPONSE_CODE.CREATED).json(
        new ApiResponse(
            HTTP_RESPONSE_CODE.CREATED,
            {
                categoryUuid: category.uuid,
                categoryName: category.name,
                color: category.color,
            },
            "Category created successfuly",
        ),
    );
}

export async function updateCategoryDetails(req, res) {
    const userId = req.userId;
    const { categoryUuid, projectUuid, categoryName, categoryDescription, categoryColor, colorMode } = req.body;

    if (!categoryUuid || !categoryName || !categoryColor) {
        logger.info(
            "catid: %s, proid: %s, name: %s, desc: %s, color: %s",
            categoryUuid,
            projectUuid,
            categoryName,
            categoryDescription,
            categoryColor,
        );
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "Category details not provided");
    }

    const userMemberOfProject = await isUserMemberOfProject(projectUuid, userId);
    if (!userMemberOfProject)
        throw new ApiError(HTTP_RESPONSE_CODE.FORBIDDEN, "You can't access this project as you aren't part of the project");

    const categoryDetails = {
        uuid: categoryUuid,
        projectUuid,
        name: categoryName,
        description: categoryDescription,
        color: categoryColor,
    };

    const [updatedCategory, project, updatedSubCategoryUuids] = await categoryServices.updateCategoryDetails(categoryDetails, colorMode);
    if (!updatedCategory || !project) {
        throw new ApiError("Failed to update category details");
    }

    try {
        const io = getIO();
        io.to(projectUuid).emit(SOCKET_IO_EVENTS.CATEGORY_UPDATED, {
            projectUuid,
            categoryUuid: updatedCategory.uuid,
            categoryName: updatedCategory.name,
            categoryDescription: updatedCategory.description,
            categoryColor: updatedCategory.color,
            updatedSubCategoryUuids,
        });
    } catch (err) {
        logger.error({ message: "Failed to emit categoryUpdated socket event", error: err });
    }

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
        new ApiResponse(
            HTTP_RESPONSE_CODE.SUCCESS,
            {
                projectUuid,
                uuid: updatedCategory.uuid,
                name: updatedCategory.name,
                description: updatedCategory.description,
                color: updatedCategory.color,
            },
            "Category details updated",
        ),
    );
}

export async function getCategoryDetails(req, res) {
    const userId = req.userId;
    const { categoryUuid, projectUuid } = req.params;

    if (!categoryUuid || !projectUuid)
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "categoryId and (or) projectId not provided");

    const userMemberOfProject = await isUserMemberOfProject(projectUuid, userId);
    if (!userMemberOfProject)
        throw new ApiError(HTTP_RESPONSE_CODE.FORBIDDEN, "You can't access this project as you aren't part of the project");

    const categoryDetails = await categoryServices.getCategoryByUuid(projectUuid, categoryUuid);

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
        new ApiResponse(
            HTTP_RESPONSE_CODE.SUCCESS,
            {
                projectUuid: categoryDetails.projectUuid,
                uuid: categoryDetails.uuid,
                name: categoryDetails.name,
                description: categoryDetails.description,
                color: categoryDetails.color,
            },
            "Category Details retrieved successfully",
        ),
    );
}
