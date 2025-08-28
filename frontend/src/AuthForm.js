import React, { useState } from 'react';
import axios from 'axios';

const AuthForm = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true); // Режим: Вход или Регистрация
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isLogin
                ? 'http://127.0.0.1:8000/api/login/' // Для входа
                : 'http://127.0.0.1:8000/api/register/'; // Для регистрации
            const response = await axios.post(url, { username, password });
            if (isLogin) {
                const token = response.data.access;
                localStorage.setItem('access_token', response.data.access); 
                localStorage.setItem('refresh_token', response.data.refresh);
                onLoginSuccess(token); // Сообщаем родительскому компоненту
            } else {
                alert('Регистрация прошла успешно! Теперь войдите.');
                setIsLogin(true);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Что-то пошло не так.');
        }
    };

    return (
        <div className="auth-form">
            <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
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
                <button type="submit">{isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Перейти к регистрации' : 'Перейти ко входу'}
            </button>
        </div>
    );
};

export default AuthForm;