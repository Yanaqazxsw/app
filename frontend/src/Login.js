import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/token/", {
        username,
        password,
      });

      const { access, refresh } = response.data;

      // Сохраняем токены
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("username", username);

      alert("✅ Успешный вход!");
      navigate("/"); // переход на главную
    } catch (error) {
      console.error(error);
      alert("❌ Ошибка входа: " + (error.response?.data?.detail || "Попробуйте еще раз."));
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Войти
        </button>
      </form>
    </div>
  );
};

export default Login;