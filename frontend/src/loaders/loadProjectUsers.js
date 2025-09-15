import { getProjectUsers } from "#services/projectServices";

export async function loader(params) {
    const projectId = params.params.projectId;
    if (projectId === "null") {
        return "";
    }
    const response = await getProjectUsers(projectId);
    return response.data.projectUsers;
}
