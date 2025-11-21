import apiClient from "../config/api";

export async function createFeature(
    name,
    gitBranch,
    assignee,
    dueDate,
    description,
    acceptanceCriteria,
    parentUuid,
    categoryUuid,
) {
    try {
        const response = await apiClient.post("feature/create", {
            name,
            gitBranch,
            assignee,
            dueDate,
            description,
            acceptanceCriteria,
            parentUuid,
            categoryUuid,
        });

        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't create feature";
    }
}

export async function getFeatureDetails(projectUuid, categoryUuid, featureUuid) {
    try {
        const response = await apiClient.get(`/featureDetail/${projectUuid}/${categoryUuid}/${featureUuid}`);

        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't fetch feature details";
    }
}

export async function updateFeatureDetails(projectUuid, categoryUuid, featureUuid, updatedFeatureDetails) {
    try {
        const response = await apiClient.put(`/feature/update`, {
            projectUuid: projectUuid,
            categoryUuid: categoryUuid,
            featureUuid: featureUuid,
            updatedFeatureDetails: updatedFeatureDetails,
        });

        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't update feature details";
    }
}
