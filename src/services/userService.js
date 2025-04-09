import axios from "axios";

const API_URL = "http://localhost:8080/user";

export const userService = {
    async editName(id, nickname) {
        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        try {
            const response = await axios.patch(`${API_URL}/edit`, { id, nickname }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при изменении имени:", error.response || error.message || error);
            throw error;
        }
    },
}