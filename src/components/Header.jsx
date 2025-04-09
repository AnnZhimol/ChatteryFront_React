import "react";
import { Button } from "antd";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";
import {Link, useNavigate} from "react-router-dom";
import '../styles/Header.css';
import { authService } from "../services/authService"; // Импортируем authService

export const Header = ({ toggleTheme, isDarkTheme, user, setUser }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        navigate("/login");
    };

    return (
        <header className={`header ${isDarkTheme ? "dark-header" : "light-header"}`}>
            <div className="logo-container">
                <Link to="/">
                    <h1 className="title">Chattery</h1>
                </Link>
            </div>
            <div className="btn-container">
                {user ? (
                    <>
                        <Link to="/profile-page">
                            <span className="user-nickname">{user.nickname}</span>
                        </Link>
                        <Button type="primary" onClick={handleLogout}>
                            Выход
                        </Button>
                    </>
                ) : (
                    <>
                        <Link to="/login">
                            <Button type="link" className="auth-button">Войти</Button>
                        </Link>
                        <Link to="/register">
                            <Button type="primary">Зарегистрироваться</Button>
                        </Link>
                    </>
                )}
                <Button
                    type="text"
                    icon={isDarkTheme ? <BulbFilled /> : <BulbOutlined />}
                    onClick={toggleTheme}
                    className="theme-toggle-button"
                />
            </div>
        </header>
    );
};
