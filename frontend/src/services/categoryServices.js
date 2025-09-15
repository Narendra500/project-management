import apiClient from "../config/api";

export async function createCategory(projectId, categoryName, categoryDescription, categoryColor, categoryParentId) {
    try {
        const response = await apiClient.post("category/create", {
            encodedProjectId: projectId,
            categoryName,
            categoryDescription,
            categoryColor,
            encodedCategoryParentId: categoryParentId,
        });

        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't create category";
    }
}

export async function getCategoryDetails(projectId, categoryId) {
    try {
        const response = await apiClient.get(`category/${projectId}/${categoryId}`, {
            encodedProjectId: projectId,
        });

        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't load category details";
    }
}
