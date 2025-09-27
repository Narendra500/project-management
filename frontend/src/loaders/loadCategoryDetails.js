import { getCategoryDetails } from "#services/categoryServices";

export async function loader(params) {
    const response = await getCategoryDetails(params.params.projectUuid, params.params.nodeUuid);
    if (response.success) {
        return response.data;
    }
}
