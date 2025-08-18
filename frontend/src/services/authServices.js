import apiClient from "#config/api";

export async function getEmailVerificationLink() {
    try {
        const response = await apiClient.get("auth/get-email-verification-link/me");

        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't send link due to server error, try again later";
    }
}

export async function verifyEmail(token) {
    try {
        const response = await apiClient.get(`auth/verify-email/${token}`);
        return response.data;
    } catch (err) {
        return err.response.data || "Couldn't verify email, try again later.";
    }
}

export async function login(userName, password, rememberMe) {
    try {
        const response = await apiClient.post(`auth/login`, {
            userName: userName,
            password: password,
            rememberMe: rememberMe,
        });

        return response.data;
    } catch (err) {
        // On failure, return a structured error object
        // err.response.data contains the error payload from the server
        return err.response.data || "Login failed";
    }
}

export async function register(userName, password) {
    try {
        const response = await apiClient.post(`auth/register`, {
            userName: userName,
            password: password,
        });

        return response.data;
    } catch (err) {
        return err.response.data || "Sign up failed";
    }
}

export async function logout() {
    try {
        const response = await apiClient.post("auth/logout");
        return response.data;
    } catch (err) {
        return err.response.data || "Log out failed";
    }
}
