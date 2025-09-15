import { getCategoryDetails } from "#services/categoryServices";

export async function loader(params) {
    const response = await getCategoryDetails(params.params.projectId, params.params.nodeId);
    if (response.success) {
        return response.data;
    }
}
