import React, { useState, useEffect, useRef } from 'react';
import './Modal.css';
import { fetchComments, createComment } from './BlogAxios';

const COMMENTS_PER_PAGE = 3;

const Modal = ({ post, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [nextPage, setNextPage] = useState(1);
  const containerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const fetchSeqRef = useRef(0);

  useEffect(() => {
    setComments([]);
    setNextPage(1);
    setHasMoreComments(true);
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  const fetchPage = async (page) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoadingComments(true);
    const mySeq = ++fetchSeqRef.current;

    try {
      const data = await fetchComments(post.id, page);
      if (mySeq !== fetchSeqRef.current) return;
      if (page === 1) {
        // при первой странице — устанавливаем ровно те комментарии, которые прислал сервер
        setComments(data.results || []);
      } else {
        setComments((prev) => {
          const newItems = (data.results || []).filter(r => !prev.some(p => p.id === r.id));
          return [...prev, ...newItems];
        });
      }
      setHasMoreComments(Boolean(data.next));
      setNextPage(page + 1);
    } catch (err) {
      console.error('Ошибка загрузки комментариев:', err);
    } finally {
      isFetchingRef.current = false;
      setLoadingComments(false);
    }
  };

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || loadingComments || !hasMoreComments) return;
    const { scrollTop, clientHeight, scrollHeight } = el;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      fetchPage(nextPage);
    }
  };

  const handleAddComment = async () => {
    const text = newComment.trim();
    if (!text) return;

    const created = await createComment(post.id, text);

    if (!created) {
      alert('Не удалось добавить комментарий. Проверьте консоль.');
      return;
    }

    setComments(prev => [created, ...prev]);
    setNewComment('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{post.title}</h2>
        <p>{post.description}</p>
        <p>Категория: {post.category}</p>
        <p>{post.content}</p>

        <div
          className="comments-section"
          ref={containerRef}
          onScroll={handleScroll}
          style={{ maxHeight: 300, overflowY: 'auto' }}
        >
          <h3>Комментарии</h3>

          <div className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Напишите комментарий"
            />
            <button onClick={handleAddComment} disabled={!newComment.trim()}>
              Добавить комментарий
            </button>
          </div>

          {loadingComments && <p>Загрузка комментариев...</p>}
          {!loadingComments && comments.length === 0 && <p>Комментариев пока нет</p>}

          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {comments.map(c => (
              <li key={c.id} style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>
                <strong>{typeof c.user === 'string' ? c.user : (c.user?.username || (Array.isArray(c.user) ? c.user[0] : 'Аноним'))}</strong>{' '}
                <span>{c.created_at ? new Date(c.created_at).toLocaleString() : ''}</span>
                <p>{c.text}</p>
              </li>
            ))}
          </ul>

          {hasMoreComments && !loadingComments && <p>Загружаем ещё комментарии...</p>}
        </div>
      </div>
    </div>
  );
};

export default Modal;