import React, { useState, useEffect } from 'react';
import { getPosts, toggleLike, toggleDislike, deletePost, updatePost } from './BlogAxios';
import Modal from './Modal';
import EditPostModal from './EditPostModal';
import './PostList.css';

const categoryNames = {
  lifestyle: "Образ жизни",
  tech: "Технологии",
  science: "Наука",
  fashion: "Мода",
  food: "Еда",
};

const PostList = ({ posts, setPosts }) => {
  const [userReactions, setUserReactions] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState('title');
  const [category, setCategory] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const token = localStorage.getItem('access_token');
  const userId = localStorage.getItem('user_id');

  const fetchPosts = async (page, sortOrder, category) => {
    setLoading(true);
    const response = await getPosts(page, sortOrder, category);
    if (response && setPosts) {
      setPosts(response.results);
      setTotalPages(Math.ceil(response.count / 5));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts(currentPage, sortOrder, category);
  }, [currentPage, sortOrder, category]);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleSortChange = (event) => { setSortOrder(event.target.value); setCurrentPage(1); };
  const handleCategoryChange = (event) => { setCategory(event.target.value); setCurrentPage(1); };

  const handleToggleLike = async (postId) => {
    if (userReactions[postId]?.like) return;
    const updatedPost = await toggleLike(postId);
    if (updatedPost && setPosts) {
      setPosts(posts.map(post =>
        post.id === postId ? { ...post, likes: updatedPost.likes } : post
      ));
      setUserReactions({
        ...userReactions,
        [postId]: { ...userReactions[postId], like: true },
      });
    }
  };

  const handleToggleDislike = async (postId) => {
    if (userReactions[postId]?.dislike) return;
    const updatedPost = await toggleDislike(postId);
    if (updatedPost && setPosts) {
      setPosts(posts.map(post =>
        post.id === postId ? { ...post, dislikes: updatedPost.dislikes } : post
      ));
      setUserReactions({
        ...userReactions,
        [postId]: { ...userReactions[postId], dislike: true },
      });
    }
  };

  const handleDeletePost = async (postId) => {
    const response = await deletePost(postId);
    if (response.success && setPosts) {
      setPosts(posts.filter(post => post.id !== postId));
      alert("Пост успешно удалён");
    } else {
      alert(response.message || "Ошибка: нельзя удалить чужой пост");
    }
  };

  const handleOpenModal = async (postId) => {
    const response = await fetch(`http://localhost:8000/api/posts/${postId}/`);
    const post = await response.json();
    setSelectedPost(post);
    setIsEditing(false);
  };

  const handleCloseModal = () => { setSelectedPost(null); setIsEditing(false); };
  const handleEditPost = (post) => { setIsEditing(true); setSelectedPost(post); };

  const handleSavePost = async (updatedPost) => {
    const response = await updatePost(updatedPost.id, updatedPost);
    if (response && setPosts) {
      setPosts(posts.map(post =>
        post.id === updatedPost.id ? updatedPost : post
      ));
      setSelectedPost(updatedPost);
      setIsEditing(false);
    }
  };

  if (loading) return <div>Загрузка постов...</div>;

  return (
    <div className="post-list">
      <h2>Посты блога</h2>

      <select onChange={handleCategoryChange} value={category}>
        <option value="">Все категории</option>
        <option value="lifestyle">Образ жизни</option>
        <option value="tech">Технологии</option>
        <option value="science">Наука</option>
        <option value="fashion">Мода</option>
        <option value="food">Еда</option>
      </select>

      <select onChange={handleSortChange} value={sortOrder}>
        <option value="title">Сортировать по названию (А-Я)</option>
        <option value="-title">Сортировать по названию (Я-А)</option>
      </select>

      {posts.length > 0 ? (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {posts.map(post => (
            <li key={post.id} style={{ marginBottom: '1rem' }}>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <small>Категория: {categoryNames[post.category] || post.category}</small>
              <div>
                <button onClick={() => handleToggleLike(post.id)} disabled={userReactions[post.id]?.like}>👍 {post.likes}</button>
                <button onClick={() => handleToggleDislike(post.id)} disabled={userReactions[post.id]?.dislike}>👎 {post.dislikes}</button>
                <button onClick={() => handleOpenModal(post.id)}>Посмотреть</button>
                <button onClick={() => handleEditPost(post)}>Редактировать</button>
                <button onClick={() => handleDeletePost(post.id)}>Удалить</button>
              </div>
            </li>
          ))}
        </ul>
      ) : <p>Нет постов для отображения</p>}

      <div>
        {Array.from({ length: totalPages }, (_, index) => (
          <button key={index} onClick={() => handlePageChange(index + 1)} disabled={index + 1 === currentPage}>
            {index + 1}
          </button>
        ))}
      </div>

      {/* ======== Модалка просмотра поста с комментариями ======== */}
      {selectedPost && !isEditing && (
        <Modal
          post={selectedPost}
          onClose={handleCloseModal}
          isAuthenticated={!!token}
          currentUser={{ id: parseInt(userId) }}
        />
      )}

      {isEditing && selectedPost && (
        <EditPostModal
          post={selectedPost}
          onClose={handleCloseModal}
          onPostUpdated={handleSavePost}
        />
      )}
    </div>
  );
};

export default PostList;