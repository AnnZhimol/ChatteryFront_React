import { useState, useEffect } from "react";
import { Button, Input, message, Card, Select, Modal } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { translationService } from "../services/translationService";
import "../styles/ProfilePage.css";
import { useNavigate } from "react-router-dom";
import {userService} from "../services/userService.js";
import {authService} from "../services/authService.js";

const { Option } = Select;

const ProfilePage = ({ theme, user, onUserUpdate }) => {
    const [translations, setTranslations] = useState([]);
    const [newUrl, setNewUrl] = useState("");
    const [newName, setNewName] = useState("");
    const [newPlatform, setNewPlatform] = useState("Выберите платформу");
    const [loading, setLoading] = useState(false);
    const [isNameModalVisible, setIsNameModalVisible] = useState(false);
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [newNickname, setNewNickname] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
    const [code, setCode] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.id) {
            fetchTranslations(user.id);
        }
    }, [user]);

    const fetchTranslations = async (userId) => {
        setLoading(true);
        try {
            const data = await translationService.getTranslations(userId);
            setTranslations(data);
        } catch (error) {
            console.error("Ошибка при получении трансляций:", error);
            message.error("Ошибка при загрузке трансляций.");
        }
        setLoading(false);
    };

    const handleAddUrl = async () => {
        if (newUrl && (newUrl.match(/^https:\/\/live\.vkvideo\.ru\/[a-zA-Z0-9_]+/) || newUrl.match(/^https:\/\/www\.twitch\.tv\/[a-zA-Z0-9_]+/))) {
            if (!newName.trim()) {
                message.error("Введите имя трансляции!");
                return;
            }

            if (!newPlatform) {
                message.error("Выберите платформу!");
                return;
            }

            if(newPlatform==="Выберите платформу") {
                message.error("Выберите платформу!");
                return;
            }

            if (newUrl.match(/^https:\/\/live\.vkvideo\.ru\/[a-zA-Z0-9_]+/) && newPlatform === "TWITCH") {
                message.error("Платформа и формат ссылки не совпадают!");
                return;
            }

            if (newUrl.match(/^https:\/\/www\.twitch\.tv\/[a-zA-Z0-9_]+/) && newPlatform === "VK_VIDEO_LIVE") {
                message.error("Платформа и формат ссылки не совпадают!");
                return;
            }

            try {
                await translationService.addTranslation(newUrl, newName, newPlatform, user.id);

                message.success("Ссылка успешно добавлена!");
                setNewUrl("");
                setNewName("");
                setNewPlatform("TWITCH");
                await fetchTranslations(user.id);
            } catch (error) {
                console.error("Ошибка при добавлении трансляции:", error);
                message.error("Не удалось добавить трансляцию.");
            }
        } else {
            message.error("Неверный формат ссылки!");
        }
    };

    const handleRemoveUrl = async (translation) => {
        await translationService.deleteTranslation(translation);
        fetchTranslations(user.id);
    };

    const handleUpdate = async (translation) => {
        navigate("/chat-page", { state: { translation } })
        await translationService.getDisconnect(translation.id);
        window.location.reload();
    }

    const handleUpdateNickname = async () => {
        if (!newNickname.trim()) {
            message.error("Введите никнейм!");
            return;
        }

        try {
            await userService.editName(user.id, newNickname);
            onUserUpdate?.({ ...user, nickname: newNickname });
            message.success("Никнейм успешно обновлен!");
            setIsNameModalVisible(false);
        } catch (error) {
            console.error("Ошибка при обновлении никнейма:", error);
            message.error("Не удалось изменить никнейм.");
        }
    };

    const handleOpenPassword = async () => {
        setIsPasswordModalVisible(true);
        try {
            await authService.sendCode(user.email);
            message.success("Код подтверждения был отправлен на вашу почту.");
        } catch (error) {
            message.error("Ошибка при отправке кода подтверждения.");
        }
    };

    const handleUpdatePassword = async () => {
        if (!code) {
            message.error("Пожалуйста, введите код подтверждения.");
            return;
        }

        if (!newPassword.trim()) {
            message.error("Введите новый пароль!");
            return;
        }

        if (newPassword.trim().length <= 10) {
            message.error("Новый пароль слишком короткий!");
            return;
        }

        if (!newPasswordConfirm.trim()) {
            message.error("Повторите новый пароль!");
            return;
        }

        if (newPasswordConfirm.trim().length <= 10) {
            message.error("Повторный пароль слишком короткий!");
            return;
        }

        if (newPasswordConfirm.trim() !== newPassword.trim()) {
            message.error("Пароли не совпадают!");
            return;
        }

        try {
            const isValidCode = await authService.check(user.email, code);
            if (isValidCode) {
                await authService.editPassword(user.email, code, newPassword, newPasswordConfirm);
                message.success("Пароль успешно обновлён!");
                setIsPasswordModalVisible(false);
            } else {
                message.error("Неверный код подтверждения.");
            }
        } catch (error) {
            message.error("Ошибка при проверке кода.");
        }
    };

    return (
        <div className={`profile-page ${theme}`}>
            <div className="profile-content">
                <h2 className="profile-header">Профиль</h2>

                <div className="profile-info">
                    <div className="profile-item">
                        <strong>Никнейм:</strong> {user?.nickname || "Неизвестно"}
                    </div>
                    <div className="profile-item">
                        <strong>Почта:</strong> {user?.email || "Не указано"}
                    </div>
                </div>

                <div style={{ marginTop: 20, marginBottom: 40 }}>
                    <Button style={{ marginRight: 10 }} onClick={() => setIsNameModalVisible(true)}>
                        Изменить никнейм
                    </Button>
                    <Button onClick={handleOpenPassword}>Изменить пароль</Button>
                </div>

                <div className="add-url">
                    <Input
                        placeholder="Введите ссылку (например: https://live.vkvideo.ru/example)"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="url-input"
                        rules={[{ required: true, message: "Введите ссылку!" }]}
                    />
                    <Input
                        placeholder="Введите название трансляции"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="url-input"
                        rules={[{ required: true, message: "Введите название!" }]}
                    />
                    <Select
                        value={newPlatform}
                        onChange={(value) => setNewPlatform(value)}
                        className="platform-select"
                        style={{ width: "100%" }}
                    >
                        <Option value="VK_VIDEO_LIVE">VK Video Live</Option>
                        <Option value="TWITCH">Twitch</Option>
                    </Select>
                    <Button
                        type="primary"
                        onClick={handleAddUrl}
                        htmlType="submit"
                        className="add-url-button"
                        style={{ marginTop: "20px" }}
                    >
                        Добавить трансляцию
                    </Button>
                </div>

                <div className="translations-list">
                    <h3>Ваши трансляции:</h3>
                    {loading ? (
                        <p>Загрузка...</p>
                    ) : translations.length === 0 ? (
                        <p>У вас нет добавленных трансляций.</p>
                    ) : (
                        <div className="translations-blocks">
                            {translations.map((translation, index) => (
                                <Card key={index} className="translation-card">
                                    <div className="translation-content" onClick={() => handleUpdate(translation)}>
                                        <div className="translation-platform">{translation.platformType}</div>
                                        <div className="translation-info">
                                            <strong>{translation.name}</strong>
                                            <a href={translation.url} target="_blank" rel="noopener noreferrer">
                                                {translation.url}
                                            </a>
                                        </div>
                                    </div>
                                    <CloseOutlined
                                        onClick={() => handleRemoveUrl(translation)}
                                        className="remove-icon"
                                    />
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal
                title="Изменение никнейма"
                open={isNameModalVisible}
                onOk={handleUpdateNickname}
                onCancel={() => setIsNameModalVisible(false)}
                okText="Сохранить"
                cancelText="Отмена"
            >
                <Input
                    style={{ marginTop: 10, marginBottom: 10 }}
                    placeholder="Введите новый никнейм"
                    value={newNickname}
                    rules={[{ required: true, message: "Введите никнейм!" }]}
                    onChange={(e) => setNewNickname(e.target.value)}
                />
            </Modal>

            <Modal
                title="Изменение пароля"
                open={isPasswordModalVisible}
                onOk={handleUpdatePassword}
                onCancel={() => setIsPasswordModalVisible(false)}
                okText="Сохранить"
                cancelText="Отмена"
            >
                <Input
                    style={{ marginTop: 10, marginBottom: 10 }}
                    placeholder="Введите код подтверждения (проверьте email)"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                <Input.Password
                    style={{ marginTop: 10, marginBottom: 10 }}
                    placeholder="Введите новый пароль"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input.Password
                    style={{ marginTop: 10, marginBottom: 10 }}
                    placeholder="Повторите новый пароль"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                />
            </Modal>
        </div>
    );
};

export default ProfilePage;
