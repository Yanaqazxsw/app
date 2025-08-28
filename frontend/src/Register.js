import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Импортируйте useNavigate

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Используйте useNavigate

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/register/', { username, password });
      alert('Пользователь успешно зарегистрирован!');
      navigate('/login'); // Перенаправьте на страницу входа
    } catch (error) {
      alert('Ошибка при регистрации: ' + (error.response?.data?.detail || 'Попробуйте еще раз.'));
    }
  };

  return (
    <div>
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
};

export default Register;