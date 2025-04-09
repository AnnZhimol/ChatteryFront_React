import axios from "axios";

const API_URL = "http://localhost:8080/banWord";

export const banWordService = {
    async getBanWords(translationId) {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        try {
            const response = await axios.get(`${API_URL}/getBanWords`, {
                params: { translationId },
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при запросе забаненных слов:", error.response || error.message || error);
            throw error;
        }
    },
    async addBanWord(word, translationId) {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        try {
            const response = await axios.post(`${API_URL}/add`, {
                word,
                translationId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || "Ошибка при добавлении забаненного слова";
        }
    },
    async deleteBanWord(banWord) {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        try {
            const response = await axios.delete(`${API_URL}/delete`, {
                data: banWord,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || "Ошибка при удалении забаненного пользователя";
        }
    },
};
