import { getAllSoftDeletedProjectNodes } from "#services/projectServices";
import { useLoaderData } from "react-router"

export async function loader({ params }) {
    const projectId = params.projectId;
    const response = await getAllSoftDeletedProjectNodes(projectId);

    return response;
}

export default function RecycleBin() {
    const softDeletedNodes = useLoaderData();

    return (
        <></>
    )
}

