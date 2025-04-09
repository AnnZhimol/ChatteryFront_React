import "react";
import { Input, Button, Form, message, App as AntdApp } from "antd";
import { useNavigate } from "react-router-dom";
import "../styles/RegisterPage.css";
import {authService} from "../services/authService.js";
import axios from "axios";

export const RegisterPage = ({ theme, setUser }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    try {
      if (values.password !== values.passwordConfirm){
        messageApi.error("Пароли не совпадают!");
        return;
      }
      try {
        const { token } = await authService.signup(values.email, values.password, values.passwordConfirm, values.nickname);
        localStorage.setItem("jwt", token);
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        messageApi.success("Регистрация прошла успешно!");
        navigate("/profile-page");
      } catch (error) {
        console.error(error);
        messageApi.error("Пользователь с такой почтой уже существует!");
      }
    } catch (error) {
      messageApi.error("Ошибка авторизации "+ error.message);
    }
  };

  return (
      <AntdApp>
      {contextHolder}
    <main className={`register-page ${theme}`}>
      <div className="form-container">
        <h1 className="form-title">Регистрация</h1>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="registration-form"
        >
          <Form.Item
            label="Имя"
            name="nickname"
            rules={[{ required: true, message: "Пожалуйста, введите ваш никнейм!" }]}
          >
            <Input placeholder="Ваш никнейм" />
          </Form.Item>

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
            rules={[{ required: true, message: "Введите пароль!", min: 11 }]}
          >
            <Input.Password placeholder="Пароль" />
          </Form.Item>

          <Form.Item
              label="Подвердите пароль"
              name="passwordConfirm"
              rules={[{ required: true, message: "Подтвердите пароль!", min: 11 }]}
          >
            <Input.Password placeholder="Подвердите пароль" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Зарегистрироваться
            </Button>
          </Form.Item>
        </Form>
      </div>
    </main>
        </AntdApp>
  );
};
