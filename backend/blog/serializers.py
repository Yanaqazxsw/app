from rest_framework import serializers
from .models import Post, Comment

class PostSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'description', 'category', 'category_display',
                  'author', 'created_at', 'updated_at', 'likes', 'dislikes']
        read_only_fields = ['author', 'likes', 'dislikes']

class CommentSerializer(serializers.ModelSerializer):
    # user только для чтения — при создании мы ставим его в perform_create
    user = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'created_at']