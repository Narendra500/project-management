import apiClient from "../config/api";

export async function createCategory(projectUuid, categoryName, categoryDescription, categoryColor, categoryParentUuid) {
    try {
        const response = await apiClient.post("category/create", {
            projectUuid: projectUuid,
            categoryName,
            categoryDescription,
            categoryColor,
            categoryParentUuid: categoryParentUuid,
        });

        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't create category";
    }
}

export async function getCategoryDetails(projectUuid, categoryUuid) {
    try {
        const response = await apiClient.get(`category/${projectUuid}/${categoryUuid}`, {
            projectUuid: projectUuid,
        });

        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't load category details";
    }
}
