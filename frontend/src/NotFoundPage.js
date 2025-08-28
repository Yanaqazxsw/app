import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div>
      <h1>Ошибка 404</h1>
      <p>Страница не найдена.</p>
      <Link to="/">Вернуться на главную</Link>
    </div>
  );
};

export default NotFoundPage;
