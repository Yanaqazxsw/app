import React, { useState, useEffect } from 'react';
import './EditPostModal.css'; // твои стили

const EditPostModal = ({ post, onClose, onPostUpdated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setDescription(post.description);
      setCategory(post.category);
    }
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updatedPost = { title, description, category };

    try {
      await onPostUpdated({ ...post, ...updatedPost });
      onClose();
    } catch (error) {
      console.error("Ошибка при обновлении поста:", error);
      alert("Не удалось обновить пост");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Редактировать пост</h2>
        <form onSubmit={handleSubmit} className="edit-post-form">
          <label>
            Название:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-field"
            />
          </label>

          <label>
            Описание:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="textarea-field"
            />
          </label>

          <label>
            Категория:
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="select-field"
            >
              <option value="lifestyle">Образ жизни</option>
              <option value="tech">Технологии</option>
              <option value="science">Наука</option>
              <option value="fashion">Мода</option>
              <option value="food">Еда</option>
            </select>
          </label>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Сохраняем..." : "Сохранить изменения"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;