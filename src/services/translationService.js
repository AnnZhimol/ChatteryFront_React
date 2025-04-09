import axios from "axios";

const API_URL = "http://localhost:8080/translation";

export const translationService = {
    async getConnect(translationId) {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        try {
            const response = await axios.get(`${API_URL}/connect`, {
                params: { translationId },
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при подключении:", error.response || error.message || error);
            throw error;
        }
    },
    async getDisconnect(translationId) {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        try {
            const response = await axios.get(`${API_URL}/disconnect`, {
                params: { translationId },
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при отключении:", error.response || error.message || error);
            throw error;
        }
    },
    async getTranslations(userId) {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        try {
            const response = await axios.get(`${API_URL}/getTranslations`, {
                params: { userId },
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при запросе трансляций:", error.response || error.message || error);
            throw error;
        }
    },
    async addTranslation(url, name, platformType, userId) {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        try {
            const response = await axios.post(`${API_URL}/add`, {
                url,
                name,
                platformType,
                userId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || "Ошибка при добавлении трансляции";
        }
    },
    async deleteTranslation(translation) {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        try {
            const response = await axios.delete(`${API_URL}/delete`, {
                data: translation,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при удалении трансляций:", error.response || error.message || error);
        }
    },
};
