import { getFeatureDetails } from "#services/featureServices";

export async function loader(params) {
    const response = await getFeatureDetails(params.params.projectId, params.params.categoryId, params.params.nodeId);
    if (response.success) {
        return response.data;
    }
}
