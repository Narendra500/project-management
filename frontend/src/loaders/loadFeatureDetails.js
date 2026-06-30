import { getFeatureDetails } from "#services/featureServices";

export async function loader({ params }) {
    const response = await getFeatureDetails(params.nodeUuid);
    if (response.success) {
        return response.data;
    }
}
