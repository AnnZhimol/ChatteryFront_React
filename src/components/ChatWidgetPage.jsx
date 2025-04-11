import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { settingService } from "../services/settingService";
import { banUserService } from "../services/banUserService";
import { banWordService } from "../services/banWordService";
import ChatWidget from "./ChatWidget.jsx";

const ChatWidgetPage = () => {
    const { translationId } = useParams();
    const messagesContainerRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const messageBufferRef = useRef([]);

    const [fontFamily, setFontFamily] = useState("Arial");
    const [backgroundColor, setBackgroundColor] = useState("#f0f0f0");
    const [textColor, setTextColor] = useState("#000000");
    const [fontSize, setFontSize] = useState(14);
    const [delay, setDelay] = useState(1000);
    const [textAlign, setTextAlign] = useState("left");
    const [filteredCategoryMood, setFilteredCategoryMood] = useState("ALL");
    const [filteredCategorySentence, setFilteredCategorySentence] = useState("ALL");

    const [banUsers, setBanUsers] = useState([]);
    const [banWords, setBanWords] = useState([]);

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

        const socket = new SockJS('http://localhost:8080/chat');
        const client = Stomp.over(socket);

        client.connect({}, () => {
            setStompClient(client);
            console.log("connected to websocket");

            client.subscribe(`/topic/translation/${translationId}`, (wsMessage) => {
                const newMessage = JSON.parse(wsMessage.body);
                messageBufferRef.current.push(newMessage);
            });
        }, (error) => {
            console.error("WebSocket connection error:", error);
        });

        return () => {
            if (stompClient) {
                stompClient.disconnect();
                console.log("WebSocket connection closed");
                setStompClient(null);
            }
        };
    }, [translationId]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (messageBufferRef.current.length === 0) return;

            const newMessage = messageBufferRef.current.shift();

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
        const loadData = async () => {
            try {
                const users = await banUserService.getBanUsers(translationId);
                setBanUsers(Array.isArray(users) ? users : []);

                const words = await banWordService.getBanWords(translationId);
                setBanWords(Array.isArray(words) ? words : []);

                const settings = await settingService.getSetting(translationId);
                if (settings) {
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
                console.error("Error loading data:", err);
            }
        };

        loadData();
    }, [translationId]);

    return (
        <div style={{ width: "100%", height: "100vh", padding: 0, margin: 0 }}>
            <ChatWidget
                messages={messages}
                messagesContainerRef={messagesContainerRef}
                fontFamily={fontFamily}
                backgroundColor={backgroundColor}
                textColor={textColor}
                fontSize={fontSize}
                textAlign={textAlign}
            />
        </div>
    );
};

export default ChatWidgetPage;