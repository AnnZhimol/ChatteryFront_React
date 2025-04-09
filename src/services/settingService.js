import axios from "axios";

const API_URL = "http://localhost:8080/setting";

export const settingService = {
    async getSetting(translationId) {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        try {
            const response = await axios.get(`${API_URL}/getStreamSettingByTranslation`, {
                params: { translationId },
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при запросе настроек:", error.response || error.message || error);
            throw error;
        }
    },
    async editSettings(id, backgroundColor, textColor, textSize, font,
                       aligmentType, delay, moodType, sentenceType, translationId) {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        try {
            const response = await axios.patch(`${API_URL}/edit`, {
                id,
                backgroundColor,
                textColor,
                textSize,
                font,
                aligmentType,
                delay,
                moodType,
                sentenceType,
                translationId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при изменении настроек:", error.response || error.message || error);
            throw error;
        }
    },
};
