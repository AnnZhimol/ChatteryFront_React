import "react";
import {useEffect, useState} from "react";

const ChatWidget = ({
                        messages,
                        messagesContainerRef,
                        fontFamily,
                        backgroundColor,
                        textColor,
                        fontSize,
                        textAlign,
                        filterEnabled
                    }) => {
    const [swearWords, setSwearWords] = useState([]);

    useEffect(() => {
        const loadSwearWords = async () => {
            try {
                const response = await fetch('/utils/swearwords.txt');
                const text = await response.text();
                const words = text.split('\n').map(word => word.trim()).filter(word => word);
                setSwearWords(words);
            } catch (error) {
                console.error("Error loading swear words:", error);
            }
        };

        loadSwearWords();
    }, []);

    const filterSwearWords = (text) => {
        if (!text || !swearWords.length || !filterEnabled) return text;

        let result = text;
        swearWords.forEach(word => {
            const regex = new RegExp(word, 'gi');
            result = result.replace(regex, match => '*'.repeat(match.length));
        });

        return result;
    };

    const getBrightness = (color) => {
        const rgb = color.match(/\w\w/g).map((x) => parseInt(x, 16));
        return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
    };

    const lightenColor = (color, percent) => {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00ff) + amt;
        const B = (num & 0x0000ff) + amt;
        return (
            "#" +
            (
                0x1000000 +
                (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
                (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
                (B < 255 ? (B < 1 ? 0 : B) : 255)
            )
                .toString(16)
                .slice(1)
        );
    };

    const darkenColor = (color, percent) => {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00ff) - amt;
        const B = (num & 0x0000ff) - amt;
        return (
            "#" +
            (
                0x1000000 +
                (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
                (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
                (B < 255 ? (B < 1 ? 0 : B) : 255)
            )
                .toString(16)
                .slice(1)
        );
    };

    const brightness = getBrightness(backgroundColor);
    const adjustedBackgroundColor =
        brightness < 128
            ? lightenColor(backgroundColor, 20)
            : darkenColor(backgroundColor, 20);
    // Функция для получения иконки настроения
    const getSentimentIcon = (sentimentType) => {
        switch (sentimentType) {
            case "POSITIVE":
                return (
                    <span style={{ color: "#4CAF50", marginLeft: "8px" }} title="Positive">
            😊
          </span>
                );
            case "NEGATIVE":
                return (
                    <span style={{ color: "#F44336", marginLeft: "8px" }} title="Negative">
            😠
          </span>
                );
            default: // NEUTRAL
                return (
                    <span style={{ color: "#FFC107", marginLeft: "8px" }} title="Neutral">
            😐
          </span>
                );
        }
    };

    // Функция для получения иконки типа предложения
    const getSentenceTypeIcon = (sentenceType) => {
        switch (sentenceType) {
            case "QUESTION":
                return (
                    <span style={{ color: textColor, marginLeft: "8px", marginRight: "8px" }} title="Question">
            ❓
          </span>
                );
            case "APPEAL":
                return (
                    <span style={{ color: textColor, marginLeft: "8px", marginRight: "8px" }} title="Appeal">
            ❗
          </span>
                );
            default: // NARRATIVE
                return (
                    <span style={{ color: textColor, marginLeft: "8px", marginRight: "8px" }} title="Narrative">
            💬
          </span>
                );
        }
    };

    return (
        <div
            style={{
                backgroundColor,
                fontFamily,
                color: textColor,
                fontSize: `${fontSize}px`,
                padding: "10px",
                height: "100%",
                overflow: "hidden",
            }}
        >
            <div
                className="messages-container no-scrollbar"
                ref={messagesContainerRef}
                style={{
                    height: "100%",
                    overflowY: "scroll",
                    paddingRight: "10px",
                }}
            >
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className="msg"
                        style={{
                            marginBottom: "10px",
                            textAlign: textAlign,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            {msg.parentUser && msg.parentMessage && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: textAlign,
                                        marginBottom: "4px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 0,
                                            height: 0,
                                            borderLeft: "5px solid transparent",
                                            borderRight: "5px solid transparent",
                                            borderTop: `5px solid ${textColor}`,
                                            marginRight: "5px",
                                            color: textColor,
                                        }}
                                    />
                                    <div
                                        className="parent-message"
                                        style={{
                                            padding: "5px 8px",
                                            borderRadius: "5px",
                                            fontSize: "0.9em",
                                            color: textColor,
                                            backgroundColor: adjustedBackgroundColor,
                                            maxWidth: "80%",
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        <strong>{msg.parentUser}:</strong> {filterSwearWords(msg.parentMessage)}
                                    </div>
                                </div>
                            )}
                            <div
                                className="message-content"
                                style={{
                                    textAlign: textAlign,
                                    wordBreak: "break-word",
                                }}
                            >
                                {getSentimentIcon(msg.sentimentType)}
                                {getSentenceTypeIcon(msg.sentenceType)}
                                <strong>{msg.user}:</strong> {filterSwearWords(msg.message)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatWidget;
