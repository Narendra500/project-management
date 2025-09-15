import apiClient from "../config/api";

export async function createFeature(
    featureName,
    featureGitBranch,
    featureAssignee,
    featureDueDate,
    featureDescription,
    featureAcceptanceCriteria,
    featureParentId,
    featureCategoryId,
) {
    try {
        const response = await apiClient.post("feature/create", {
            featureName: featureName,
            featureGitBranch,
            featureAssignee,
            featureDueDate,
            featureDescription,
            featureAcceptanceCriteria,
            encodedFeatureParentId: featureParentId,
            encodedCategoryId: featureCategoryId,
        });

        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't create feature";
    }
}

export async function getFeatureDetails(projectId, categoryId, featureId) {
    try {
        const response = await apiClient.get(`/featureDetail/${projectId}/${categoryId}/${featureId}`);
        console.log(response.data);

        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't fetch feature details";
    }
}
