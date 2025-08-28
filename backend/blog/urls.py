from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import PostViewSet, toggle_like, toggle_dislike, CommentListView, CommentCreateView, CommentDeleteView, RegisterView

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')

urlpatterns = [
    path('', include(router.urls)),

    # лайки/дизлайки
    path('posts/<int:post_id>/toggle_like/', toggle_like, name='toggle_like'),
    path('posts/<int:post_id>/toggle_dislike/', toggle_dislike, name='toggle_dislike'),

    # комментарии
    path('posts/<int:post_id>/comments/', CommentListView.as_view(), name='comments-list'),
    path('posts/<int:post_id>/comments/create/', CommentCreateView.as_view(), name='create-comment'),
    path('comments/<int:pk>/delete/', CommentDeleteView.as_view(), name='delete-comment'),

    # регистрация и JWT
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]