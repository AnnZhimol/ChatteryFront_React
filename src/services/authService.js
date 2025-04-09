import axios from "axios";

const API_URL = "http://localhost:8080/auth";

export const authService = {
    async login(email, password) {
        try {
            const response = await axios.post(`${API_URL}/signIn`, { email, password });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || "Ошибка авторизации";
        }
    },

    async signup(email, password, passwordConfirm, nickname) {
        try {
            const response = await axios.post(`${API_URL}/signUp`, { email, password, passwordConfirm, nickname });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || "Ошибка авторизации";
        }
    },

    async getCurrentUser() {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        const response = await axios.get(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data;
    },

    async editPassword(email, code, newPassword, confirmPassword) {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        try {
            const response = await axios.patch(`${API_URL}/editPassword`, null, {
                params: { email, code, newPassword, confirmPassword },
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при изменении пароля:", error.response || error.message || error);
            throw error;
        }
    },

    async check(email, code) {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        try {
            const response = await axios.get(`${API_URL}/check`, {
                params: { email, code },
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при изменении пароля:", error.response || error.message || error);
            throw error;
        }
    },

    async sendCode(email) {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        try {
            const response = await axios.get(`${API_URL}/sendCode`, {
                params: { email },
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при изменении пароля:", error.response || error.message || error);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem("jwt");
    },

    getToken() {
        return localStorage.getItem("jwt");
    },

    isAuthenticated() {
        return !!this.getToken();
    },
};
