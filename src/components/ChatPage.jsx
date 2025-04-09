import  { useState, useEffect, useRef } from "react";
import { Button, Select, Slider, Input, message } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import {useLocation} from "react-router-dom";
import "../styles/ChatPage.css";
import {banUserService} from "../services/banUserService.js";
import {banWordService} from "../services/banWordService.js";
import {settingService} from "../services/settingService.js";
import {translationService} from "../services/translationService.js";

const { Option } = Select;

const ChatPage = () => {
  const location = useLocation();
  const { translation } = location.state || {};

  const [fontFamily, setFontFamily] = useState("Arial");
  const [backgroundColor, setBackgroundColor] = useState("#f0f0f0");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(14);
  const [delay, setDelay] = useState(1000);
  const [textAlign, setTextAlign] = useState("left");

  const [banUsers, setBanUsers] = useState([]);
  const [banWords, setBanWords] = useState([]);
  const [newBanUsername, setNewBanUsername] = useState("");
  const [newBanWord, setNewBanWord] = useState("");

  const [filteredCategoryMood, setFilteredCategoryMood] = useState("ALL");
  const [filteredCategorySentence, setFilteredCategorySentence] = useState("ALL");

  const [settingId, setSettingId] = useState(null);

  const messagesContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const messageBufferRef = useRef([]);

  const getBrightness = (color) => {
    const rgb = color.match(/\w\w/g).map(x => parseInt(x, 16));
    const brightness = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]);
    return brightness;
  };

// Функция для осветления цвета
  const lightenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;

    return `#${(0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1)}`;
  };

// Функция для затемнения цвета
  const darkenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;

    return `#${(0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1)}`;
  };

  const brightness = getBrightness(backgroundColor);
  const adjustedBackgroundColor = brightness < 128 ? lightenColor(backgroundColor, 20) : darkenColor(backgroundColor, 20);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scroll({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    if (stompClient) return;

    translationService.getConnect(translation.id);

    const socket = new SockJS('http://localhost:8080/chat');
    const client = Stomp.over(socket);

    client.connect({}, () => {
      setStompClient(client);
      message.success("connected");

      client.subscribe(`/topic/translation/${translation.id}`, (wsMessage) => {
        const newMessage = JSON.parse(wsMessage.body);
        // Добавляем сообщение в буфер вместо немедленного отображения
        messageBufferRef.current.push(newMessage);
      });
    }, (error) => {
      console.error("Ошибка WebSocket подключения:", error);
      message.error("WebSocket соединение не удалось");
    });

    return () => {
      if (stompClient) {
        stompClient.disconnect();
        console.log("WebSocket соединение закрыто");
        setStompClient(null);
      }
    };
  }, [translation.id]);

  // Обработка сообщений из буфера с заданной задержкой
  useEffect(() => {
    const interval = setInterval(() => {
      if (messageBufferRef.current.length === 0) return;

      const newMessage = messageBufferRef.current.shift();

      // Проверка фильтров
      const containsBannedWord = banWords.some(wordObj =>
          newMessage.message.toLowerCase().includes(wordObj.word.toLowerCase())
      );

      const isUserBanned = banUsers.some(userObj =>
          userObj.username.toLowerCase() === newMessage.user.toLowerCase()
      );

      const moodMatches =
          filteredCategoryMood === "ALL" ||
          newMessage.sentimentType === filteredCategoryMood;

      const sentenceMatches =
          filteredCategorySentence === "ALL" ||
          newMessage.sentenceType === filteredCategorySentence;

      if (!containsBannedWord && !isUserBanned && moodMatches && sentenceMatches) {
        setMessages((prev) => [...prev, newMessage]);
      }
    }, delay);

    return () => clearInterval(interval);
  }, [delay, banWords, banUsers, filteredCategoryMood, filteredCategorySentence]);

  useEffect(() => {
    if (!translation) return;

    const loadData = async () => {
      try {
        const users = await banUserService.getBanUsers(translation.id);
        setBanUsers(Array.isArray(users) ? users : []);

        const words = await banWordService.getBanWords(translation.id);
        setBanWords(Array.isArray(words) ? words : []);

        const settings = await settingService.getSetting(translation.id);
        if (settings) {
          setSettingId(settings.id);
          setBackgroundColor(settings.backgroundColor || "#f0f0f0");
          setTextColor(settings.textColor || "#000000");
          setFontSize(settings.textSize || 14);
          setFontFamily(settings.font || "Arial");
          setTextAlign(settings.aligmentType || "left");
          setDelay(settings.delay || 1000);
          setFilteredCategoryMood(settings.moodType || "ALL");
          setFilteredCategorySentence(settings.sentenceType || "ALL");
        }
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        message.error("Не удалось загрузить настройки или данные.");
      }
    };

    loadData();
  }, [translation]);

  const saveSettings = async () => {
    if (!settingId) {
      message.error("ID настроек не найден");
      return;
    }

    try {
      await settingService.editSettings(
          settingId,
          backgroundColor,
          textColor,
          fontSize,
          fontFamily,
          textAlign,
          delay,
          filteredCategoryMood,
          filteredCategorySentence,
          translation.id
      );
      message.success("Настройки успешно сохранены!");
    } catch (err) {
      message.error("Ошибка при сохранении настроек");
    }
  };

  const handleAddUser = async () => {
    try {
      if (!newBanUsername){
        message.error("Введите никнейм!")
        return;
      }
      await banUserService.addBanUser(newBanUsername, translation.id);
      const users= await banUserService.getBanUsers(translation.id);
      setBanUsers(Array.isArray(users) ? users : []);
      setNewBanUsername("");
    } catch (err) {
      alert(err);
    }
  };

  const handleDeleteUser = async (banUser) => {
    try {
      await banUserService.deleteBanUser(banUser);
      const users= await banUserService.getBanUsers(translation.id);
      setBanUsers(Array.isArray(users) ? users : []);
    } catch (err) {
      alert(err);
    }
  };

  const handleAddWord = async () => {
    try {
      if (!newBanWord){
        message.error("Введите слово!")
        return;
      }
      await banWordService.addBanWord(newBanWord, translation.id);
      const words = await banWordService.getBanWords(translation.id);
      setBanWords(Array.isArray(words) ? words : []);
      setNewBanWord("");
    } catch (err) {
      alert(err);
    }
  };

  const handleDeleteWord = async (banWord) => {
    try {
      await banWordService.deleteBanWord(banWord);
      const words = await banWordService.getBanWords(translation.id);
      setBanWords(Array.isArray(words) ? words : []);
    } catch (err) {
      alert(err);
    }
  };

  if (!translation) return <p>Трансляция не выбрана</p>;

  return (
    <div className="chat-page">
      <div className="chat-settings">
        <h2>Настройки чата для трансляции {translation.name}</h2>

        <div className="setting-item">
          <label>Шрифт:</label>
          <Select value={fontFamily} onChange={setFontFamily} style={{ width: "100%" }}>
            <Option value="Arial">Arial</Option>
            <Option value="Courier New">Courier New</Option>
            <Option value="Verdana">Verdana</Option>
            <Option value="Segoe UI">Segoe UI</Option>
            <Option value="Tahoma">Tahoma</Option>
            <Option value="Times New Roman">Times New Roman</Option>
            <Option value="Gabriola">Gabriola</Option>
            <Option value="Georgia">Georgia</Option>
            <Option value="Impact">Impact</Option>
            <Option value="Gill Sans MT">Gill Sans MT</Option>
            <Option value="Palatino">Palatino</Option>
            <Option value="Segoe Print">Segoe Print</Option>
            <Option value="Segoe Script">Segoe Script</Option>
            <Option value="Calibri">Calibri</Option>
            <Option value="Cascadia Code">Cascadia Code</Option>
            <Option value="Century Gothic">Century Gothic</Option>
            <Option value="Comic Sans MS">Comic Sans MS</Option>
            <Option value="Consolas">Consolas</Option>
            <Option value="Constantia">Constantia</Option>
          </Select>
        </div>

        <div className="setting-item">
          <label>Цвет фона чата:</label>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div className="setting-item">
          <label>Цвет текста сообщений:</label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div className="setting-item">
          <label>Размер текста:</label>
          <Slider
            min={12}
            max={24}
            value={fontSize}
            onChange={setFontSize}
            style={{ width: "100%" }}
          />
        </div>

        <div className="setting-item">
          <label>Задержка между сообщениями (мс):</label>
          <Slider
            min={0}
            max={60000}
            value={delay}
            onChange={setDelay}
            style={{ width: "100%" }}
          />
        </div>

        <div className="setting-item">
          <label>Выравнивание текста:</label>
          <Select value={textAlign} onChange={setTextAlign} style={{ width: "100%" }}>
            <Option value="left">Слева</Option>
            <Option value="center">По центру</Option>
            <Option value="right">Справа</Option>
          </Select>
        </div>

        <div className="setting-item">
          <label>Фильтр сообщений (цель высказывания):</label>
          <Select value={filteredCategorySentence} onChange={setFilteredCategorySentence} style={{ width: "100%" }}>
            <Option value="ALL">Все</Option>
            <Option value="QUESTION">Вопрос</Option>
            <Option value="OPINION">Повествование</Option>
            <Option value="APPEAL">Призыв</Option>
          </Select>
        </div>

        <div className="setting-item">
          <label>Фильтр сообщений (настроение):</label>
          <Select value={filteredCategoryMood} onChange={setFilteredCategoryMood} style={{ width: "100%" }}>
            <Option value="ALL">Все</Option>
            <Option value="NEUTRAL">Нейтральные</Option>
            <Option value="POSITIVE">Позитивные</Option>
            <Option value="NEGATIVE">Негативные</Option>
          </Select>
        </div>
        <div className="setting-item">
        <Button type="primary" onClick={saveSettings} style={{ width: "100%", marginBottom: "20px"}}>
          Сохранить настройки
        </Button>
        </div>

        <div className="setting-item">
          <label>Заблокированные слова:</label>
          <label style={{ color: "grey", fontStyle: "italic" }}>Чтобы сохранить, нажмите ENTER</label>
          <Input
            placeholder="Введите слово"
            value={newBanWord}
            onChange={(e) => setNewBanWord(e.target.value)}
            onPressEnter={handleAddWord}
            style={{ width: "100%" }}
          />
          {banWords.map((item, index) => (
            <div key={index} className="banned-item">
              {item.word} <CloseOutlined onClick={() => handleDeleteWord(item)} />
            </div>
          ))}
        </div>

        <div className="setting-item">
          <label>Заблокированные никнеймы:</label>
          <label style={{ color: "grey", fontStyle: "italic" }}>Чтобы сохранить, нажмите ENTER</label>
          <Input
            placeholder="Введите ник"
            value={newBanUsername}
            onChange={(e) => setNewBanUsername(e.target.value)}
            onPressEnter={handleAddUser}
            style={{ width: "100%" }}
          />
          {banUsers.map((item, index) => (
            <div key={index} className="banned-item">
              {item.username} <CloseOutlined onClick={() => handleDeleteUser(item)} />
            </div>
          ))}
        </div>
      </div>

      <div
          className="chat-widget"
          style={{
            backgroundColor: backgroundColor,
            fontFamily: fontFamily,
            color: textColor,
            fontSize: `${fontSize}px`,
          }}
      >
        <div className="messages-container" ref={messagesContainerRef}>
          {messages.map((msg, index) => (
              <div key={index} className="msg" style={{ textAlign: textAlign }}>
                {msg.parentUser && msg.parentMessage && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: textAlign }}>
                      <div
                          style={{
                            width: 0,
                            height: 0,
                            borderLeft: '5px solid transparent',
                            borderRight: '5px solid transparent',
                            borderTop: `5px solid ${textColor}`,
                            marginRight: '5px',
                            color: textColor
                          }}
                      />
                      <div
                          className="parent-message"
                          style={{
                            padding: '5px',
                            borderRadius: '5px',
                            fontSize: '0.9em',
                            color: textColor,
                            backgroundColor: adjustedBackgroundColor,
                            textAlign: textAlign
                          }}
                      >
                        <strong>{msg.parentUser}:</strong> {msg.parentMessage}
                      </div>
                    </div>
                )}
                <div
                    className="message-content"
                    style={{
                      textAlign: textAlign,
                    }}
                >
                  <strong>{msg.user}:</strong> {msg.message}
                </div>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
