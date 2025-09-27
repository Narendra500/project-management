import { getProjectUsers } from "#services/projectServices";

export async function loader({ params }) {
    const projectUuid = params.projectUuid;
    if (projectUuid === "null") {
        return "";
    }
    const response = await getProjectUsers(projectUuid);
    return response.data.projectUsers;
}
