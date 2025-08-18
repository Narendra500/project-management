import { useParams } from "react-router";
import { getProjectData } from "#services/projectServices";

export async function loader({ params }) {
    const projectId = params.projectId;
    const response = await getProjectData(projectId);
    console.log(response);
    return response.data;
}

export default function TreeViewComponent() {
    return <div className="h-full bg-black">
    </div>;
}
