import  { useState, useEffect } from "react";
import { ConfigProvider, App as AntdApp, theme } from "antd";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Header } from "./components/Header.jsx";
import { Footer } from "./components/Footer.jsx";
import { HomePage } from "./components/HomePage.jsx";
import { RegisterPage } from "./components/RegisterPage.jsx";
import { LoginPage } from "./components/LoginPage.jsx";
import ChatPage from "./components/ChatPage.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import Cookies from "js-cookie";
import './styles/global.css';
import { authService } from "./services/authService";

const App = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const themeFromCookie = Cookies.get("theme");
    return themeFromCookie === "dark";
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authService.isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    Cookies.set("theme", newTheme ? "dark" : "light", { expires: 365 });
  };

  if (loading) return <div>Загрузка...</div>;

  return (
      <ConfigProvider
          theme={{
            algorithm: isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm,
          }}
      >
        <AntdApp>
          <Router>
            <div className="main-container">
              <div className={isDarkTheme ? "dark" : "light"}>
                <Header
                    toggleTheme={toggleTheme}
                    isDarkTheme={isDarkTheme}
                    user={user}
                    setUser={setUser}
                />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/register" element={user ? <Navigate to="/profile-page" replace /> : <RegisterPage setUser={setUser} />} />
                  <Route
                      path="/login"
                      element={
                        user ? <Navigate to="/profile-page" replace /> : <LoginPage setUser={setUser}/>
                      }
                  />

                  {user ? (
                      <>
                        <Route path="/chat-page" element={<ChatPage />} />
                        <Route path="/profile-page" element={<ProfilePage user={user} onUserUpdate={(updatedUser) => setUser(updatedUser)} />} />
                      </>
                  ) : (
                      <>
                        <Route path="/chat-page" element={<Navigate to="/login" replace />} />
                        <Route path="/profile-page" element={<Navigate to="/login" replace />} />
                        <Route path="/stat" element={<Navigate to="/login" replace />} />
                      </>
                  )}
                </Routes>
                <Footer />
              </div>
            </div>
          </Router>
        </AntdApp>
      </ConfigProvider>
  );
};

export default App;
