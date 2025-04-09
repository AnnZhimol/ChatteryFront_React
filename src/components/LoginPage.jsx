import "react";
import { Input, Button, Form, message, App as AntdApp } from "antd";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import {authService} from "../services/authService.js";
import axios from "axios";

export const LoginPage = ({ theme, setUser }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    try {
      const { token } = await authService.login(values.email, values.password);
      localStorage.setItem("jwt", token);
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      messageApi.success("Авторизация успешна!");
        navigate("/profile-page");
    } catch (error) {
      messageApi.error("Ошибка авторизации "+ error.message);
    }
  };

  return (
      <AntdApp>
        {contextHolder}
        <main className={`login-page ${theme}`}>
          <div className="form-container">
            <h1 className="form-title">Вход</h1>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                className="login-form"
            >
              <Form.Item
                  label="Электронная почта"
                  name="email"
                  rules={[
                    { required: true, message: "Введите вашу почту!" },
                    { type: "email", message: "Неверный формат электронной почты!" },
                  ]}
              >
                <Input placeholder="example@email.com" />
              </Form.Item>

              <Form.Item
                  label="Пароль"
                  name="password"
                  rules={[{ required: true, message: "Введите пароль!" }]}
              >
                <Input.Password placeholder="Пароль" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Войти
                </Button>
              </Form.Item>
            </Form>
          </div>
        </main>
      </AntdApp>
  );
};
