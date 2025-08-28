import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import AuthForm from './AuthForm';
import PostList from './PostList';
import AddPostForm from './AddPostForm';
import NotFoundPage from './NotFoundPage';
import { getPosts } from './BlogAxios'; // Функция для получения постов
import './App.css';

const App = () => {
  const [posts, setPosts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);

  // Загружаем посты при монтировании
  useEffect(() => {
    const fetchPosts = async () => {
      const data = await getPosts(); // Получаем все посты
      if (data && data.results) {
        setPosts(data.results);
      }
    };
    fetchPosts();
  }, []);

  // Функция для обновления списка после добавления нового поста
  const handlePostAdded = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const handleLoginSuccess = (token) => {
    localStorage.setItem('access_token', token);
    setToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
  };

  return (
    <div className="App">
      <h1>Добро пожаловать в блог</h1>
      {token ? (
        <>
          <button onClick={handleLogout}>Выйти</button>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <AddPostForm onPostAdded={handlePostAdded} />
                  <PostList posts={posts} setPosts={setPosts}/>
                </>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </>
      ) : (
        <AuthForm onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
};

export default App;
