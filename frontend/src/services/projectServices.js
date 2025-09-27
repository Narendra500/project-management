import apiClient from "#config/api";

export async function createUserProject(projectName, projectDescription) {
    try {
        const response = await apiClient.post("/project/create", {
            projectName: projectName,
            projectDescription: projectDescription,
        });

        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't create project";
    }
}

export async function getUserProjects() {
    try {
        const response = await apiClient.get("/project/user/me", {});
        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't create project";
    }
}

export async function updateActiveProject(projectUuid) {
    try {
        const response = await apiClient.patch("/user/me/updateUserActiveProject", {
            projectUuid: projectUuid,
        });

        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't set the project as active";
    }
}

export async function getProjectData(projectUuid) {
    try {
        const response = await apiClient.get(`/project/${projectUuid}`);
        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't fetch project data";
    }
}

export async function getProjectUsers(projectUuid) {
    try {
        const response = await apiClient.get(`/projectUsers/${projectUuid}`);
        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't fetch project users";
    }
}

export async function getAllSoftDeletedProjectNodes(projectUuid) {
    try {
        const response = await apiClient.get(`/project/soft-deleted-nodes/${projectUuid}`);
        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't fetch recycled nodes";
    }
}
