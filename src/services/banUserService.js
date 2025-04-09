import axios from "axios";

const API_URL = "http://localhost:8080/banUser";

export const banUserService = {
    async getBanUsers(translationId) {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        try {
            const response = await axios.get(`${API_URL}/getBanUsers`, {
                params: { translationId },
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при запросе забаненных пользователей:", error.response || error.message || error);
            throw error;
        }
    },
    async addBanUser(username, translationId) {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        try {
            const response = await axios.post(`${API_URL}/add`, {
                username,
                translationId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || "Ошибка при добавлении забаненного пользователя";
        }
    },
    async deleteBanUser(banUser) {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        try {
            const response = await axios.delete(`${API_URL}/delete`, {
                data: banUser,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || "Ошибка при удалении забаненного пользователя";
        }
    },
};
