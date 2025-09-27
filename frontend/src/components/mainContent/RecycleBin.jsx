import { getAllSoftDeletedProjectNodes } from "#services/projectServices";
import { useLoaderData } from "react-router"

export async function loader({ params }) {
    const projectUuid = params.projectUuid;
    const response = await getAllSoftDeletedProjectNodes(projectUuid);

    return response;
}

export default function RecycleBin() {
    const softDeletedNodes = useLoaderData();

    return (
        <></>
    )
}

