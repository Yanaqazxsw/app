import React, { useState } from 'react';
import { createPost } from './BlogAxios';
import './AddPostForm.css';

const AddPostForm = ({ onPostAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'lifestyle',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Создаём новый пост
      const newPost = await createPost(
        formData.title,
        formData.description,
        formData.category
      );

      alert('Пост успешно добавлен! ✍️');

      if (onPostAdded) onPostAdded(newPost);

      // Очищаем форму
      setFormData({ title: '', description: '', category: 'lifestyle' });
    } catch (error) {
      if (error.response?.data) {
        const errors = error.response.data;
        let msg = '❌ Ошибка при добавлении поста:\n';
        if (errors.title) msg += `▪ Название: ${errors.title.join(', ')}\n`;
        if (errors.description) msg += `▪ Описание: ${errors.description.join(', ')}\n`;
        if (errors.category) msg += `▪ Категория: ${errors.category.join(', ')}\n`;
        alert(msg);
      } else {
        alert('❌ Ошибка при добавлении поста: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-post-form">
      <h2>Добавить новый пост</h2>

      <label>
        Название:
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="input-field"
        />
      </label>

      <label>
        Описание:
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="textarea-field"
        />
      </label>

      <label>
        Категория:
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="select-field"
          required
        >
          <option value="lifestyle">Образ жизни</option>
          <option value="tech">Технологии</option>
          <option value="science">Наука</option>
          <option value="fashion">Мода</option>
          <option value="food">Еда</option>
        </select>
      </label>

      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? 'Добавляем...' : 'Добавить пост'}
      </button>
    </form>
  );
};

export default AddPostForm;