import { getFeatureDetails } from "#services/featureServices";

export async function loader({ params }) {
    const response = await getFeatureDetails(params.projectUuid, params.categoryUuid, params.nodeUuid);
    if (response.success) {
        return response.data;
    }
}
