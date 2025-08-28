from django.db import models
from django.contrib.auth.models import User

CATEGORY_CHOICES = [
    ('tech', 'Технологии'),
    ('science', 'Наука'),
    ('fashion', 'Мода'),
    ('food', 'Еда'),
    ('lifestyle', 'Образ жизни'),
]
class Post(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.IntegerField(default=0)
    dislikes = models.IntegerField(default=0)

    def __str__(self):
        return self.title

class Like(models.Model):
    post = models.ForeignKey(Post, related_name="post_likes", on_delete=models.CASCADE)
    session_id = models.CharField(max_length=100)  # Идентификатор сессии пользователя

class Dislike(models.Model):
    post = models.ForeignKey(Post, related_name="post_dislikes", on_delete=models.CASCADE)
    session_id = models.CharField(max_length=100)  # Идентификатор сессии пользователя

class Comment(models.Model):
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Comment by {self.user.username} on {self.post.title}'