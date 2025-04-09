import "react";
import {
  CheckCircleOutlined,
  SettingOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import "../styles/HomePage.css";

export const HomePage = ({ theme }) => {
  return (
    <main className="home-page">
      <div className="background-section">
        <div className="overlay">
          <h1 className="page-title">Chattery</h1>
          <p className="page-description">
            Фильтруй, персонализируй, демонстрируй!
          </p>
        </div>
      </div>

      <div className="info-section">
        <div className="info-block">
          <CheckCircleOutlined className="info-icon" />
          <p>
            Введите ссылку на трансляцию со стримингового сервиса VK Play Live или Twitch.
            Пример: https://live.vkvideo.ru/example
          </p>
        </div>
        <div className="info-block">
          <SettingOutlined className="info-icon" />
          <p>Настройте чат согласно Вашим предпочтениям.</p>
        </div>
        <div className="info-block">
          <CopyOutlined className="info-icon" />
          <p>Скопируйте ссылку на виджет чата и используйте ее в OBS.</p>
        </div>
      </div>
    </main>
  );
};
