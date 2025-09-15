import { HTTP_RESPONSE_CODE } from "#constants/api.response.codes";
import { isUserMemberOfProject } from "#services/project.users.services";
import * as categoryServices from "#services/category.services";
import { ApiError } from "#utils/api.error";
import { ApiResponse } from "#utils/api.response";
import sqids from "#config/sqids";

export async function createCategory(req, res) {
    const userId = req.userId;
    const { encodedProjectId, categoryName, categoryColor } = req.body;
    let { categoryDescription, encodedCategoryParentId } = req.body;

    if (!encodedProjectId || !categoryName || !categoryColor)
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "required fields not provided for category");

    const [projectId] = sqids.decode(encodedProjectId);
    const categoryParentId = encodedCategoryParentId ? sqids.decode(encodedCategoryParentId)[0] : null;

    // check if user is authorized to perform this action
    const userAuthorized = await categoryServices.canUserCreateCategory(userId, projectId);

    if (!userAuthorized)
        throw new ApiError(
            HTTP_RESPONSE_CODE.UNAUTHORIZED,
            "not authorized to perform this action, check if you have writePermission for the project",
        );

    if (categoryParentId) {
        const subCategoryAlreadyExists = await categoryServices.checkSubCategoryExists(categoryName, categoryParentId);
        if (subCategoryAlreadyExists)
            throw new ApiError(HTTP_RESPONSE_CODE.CONFLICT, "Sub Category already exists in the given category");
    } else {
        const categoryAlreadyExists = await categoryServices.checkCategoryExists(categoryName, projectId);
        if (categoryAlreadyExists) throw new ApiError(HTTP_RESPONSE_CODE.CONFLICT, "Category already exists in the project");
    }

    const category = await categoryServices.createCategory(
        projectId,
        categoryName,
        categoryDescription,
        categoryColor,
        categoryParentId,
    );

    res.status(HTTP_RESPONSE_CODE.CREATED).json(
        new ApiResponse(
            HTTP_RESPONSE_CODE.CREATED,
            {
                categoryId: sqids.encode([category.id]),
                categoryName: category.name,
                color: category.color,
            },
            "Category created successfuly",
        ),
    );
}

export async function getCategoryDetails(req, res) {
    const userId = req.userId;
    const { encodedCategoryId, encodedProjectId } = req.params;
    console.log(req.params);

    if (!encodedCategoryId || !encodedProjectId)
        throw new ApiError(HTTP_RESPONSE_CODE.BAD_REQUEST, "categoryId and (or) projectId not provided");

    const [categoryId] = sqids.decode(encodedCategoryId);
    const [projectId] = sqids.decode(encodedProjectId);

    const userMemberOfProject = await isUserMemberOfProject(projectId, userId);
    if (!userMemberOfProject)
        throw new ApiError(HTTP_RESPONSE_CODE.FORBIDDEN, "You can't access this project as you aren't part of the project");

    const categoryDetails = await categoryServices.getCategoryById(projectId, categoryId);

    res.status(HTTP_RESPONSE_CODE.SUCCESS).json(
        new ApiResponse(
            HTTP_RESPONSE_CODE.SUCCESS,
            { name: categoryDetails.name, description: categoryDetails.description },
            "Category Details retrieved successfully",
        ),
    );
}
