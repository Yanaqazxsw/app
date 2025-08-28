import axios from 'axios';

const API_URL = "http://127.0.0.1:8000/api";

// обновление токена
export const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return null;

  try {
    const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) throw new Error('Ошибка при обновлении токена');

    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    return data.access;
  } catch (error) {
    console.error('Ошибка refreshToken:', error);
    return null;
  }
};

// axios с токеном
const axiosWithAuth = async (method, url, data = null, config = {}) => {
  let token = localStorage.getItem("access_token");
  const headers = { ...config.headers, Authorization: token ? `Bearer ${token}` : '' };

  try {
    const response = await axios({ method, url, data, headers, ...config });
    return response;
  } catch (error) {
    if (error.response?.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        return await axios({ method, url, data, headers, ...config });
      }
    }
    throw error;
  }
};

// посты
export const getPosts = async (page=1, sortOrder="title", category="") => {
  try {
    const response = await axios.get(`${API_URL}/posts/`, {
      params: { page, ordering: sortOrder, category: category || undefined },
    });
    return response.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    return null;
  }
};

export const createPost = async (title, description, category) => {
  try {
    const response = await axiosWithAuth('post', `${API_URL}/posts/`, { title, description, category });
    return response.data;
  } catch (error) {
    console.error("Ошибка при добавлении поста:", error.response?.data || error.message);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    await axiosWithAuth('delete', `${API_URL}/posts/${postId}/`);
    return { success: true };
  } catch (error) {
    if (error.response?.status === 403) return { success: false, message: "Вы не можете удалить чужой пост" };
    return { success: false, message: "Ошибка при удалении поста" };
  }
};

export const updatePost = async (postId, updatedData) => {
  try {
    const response = await axiosWithAuth('put', `${API_URL}/posts/${postId}/`, updatedData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      alert(error.response.data.detail || "Вы не можете редактировать чужой пост");
      return null;
    }
    console.error("Ошибка при обновлении поста:", error.response?.data || error.message);
    return null;
  }
};

// лайки
export const toggleLike = async (postId) => {
  try {
    const response = await axiosWithAuth('post', `${API_URL}/posts/${postId}/toggle_like/`);
    return response.data;
  } catch (error) {
    console.error("Ошибка при добавлении лайка:", error.response?.data || error.message);
    return null;
  }
};

export const toggleDislike = async (postId) => {
  try {
    const response = await axiosWithAuth('post', `${API_URL}/posts/${postId}/toggle_dislike/`);
    return response.data;
  } catch (error) {
    console.error("Ошибка при добавлении дизлайка:", error.response?.data || error.message);
    return null;
  }
};

// комментарии
export const fetchComments = async (postId, page = 1) => {
  try {
    const response = await axios.get(`${API_URL}/posts/${postId}/comments/`, {
      params: { page }
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при получении комментариев:", error.response?.data || error.message);
    return null;
  }
};

export const createComment = async (postId, text) => {
  try {
    const response = await axiosWithAuth('post', `${API_URL}/posts/${postId}/comments/create/`, { text });
    return response.data;
  } catch (error) {
    console.error("Ошибка при создании комментария:", error.response?.data || error.message);
    return null;
  }
};

export const deleteComment = async (commentId) => {
  try {
    await axiosWithAuth('delete', `${API_URL}/comments/${commentId}/delete/`);
    return true;
  } catch (error) {
    console.error("Ошибка при удалении комментария:", error.response?.data || error.message);
    return false;
  }
};

// вход / токены
export const getTokens = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/token/`, { username, password });
    if (response.data?.access && response.data?.refresh) {
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      const userResponse = await axios.get(`${API_URL}/user/`, {
        headers: { Authorization: `Bearer ${response.data.access}` },
      });
      localStorage.setItem("user_id", userResponse.data.id);
      localStorage.setItem("username", userResponse.data.username);
    }
  } catch (error) {
    console.error("Ошибка при получении токенов:", error.response?.data || error.message);
  }
};