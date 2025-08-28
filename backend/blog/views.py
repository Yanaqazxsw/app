from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User

from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.generics import ListAPIView, CreateAPIView, DestroyAPIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend, FilterSet, CharFilter
from rest_framework.filters import OrderingFilter

from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer


# фильтр по категории
class PostFilter(FilterSet):
    category = CharFilter(field_name="category", lookup_expr="exact")

    class Meta:
        model = Post
        fields = ["category"]


# посты
class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = PostFilter
    ordering_fields = ['title', 'created_at']
    ordering = ['title']

    def get_queryset(self):
        qs = Post.objects.all()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)

        ordering = self.request.query_params.get('ordering')
        allowed = set(self.ordering_fields + ['-' + f for f in self.ordering_fields])
        if ordering and all(part in allowed for part in ordering.replace(' ', '').split(',')):
            qs = qs.order_by(*[o for o in ordering.replace(' ', '').split(',')])
        else:
            qs = qs.order_by('-created_at')
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.author != self.request.user:
            raise PermissionDenied("Вы не можете редактировать чужой пост")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise PermissionDenied("Вы не можете удалять чужой пост")
        instance.delete()


# лайки / дизлайки
@csrf_exempt
def toggle_like(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    liked_posts = set(request.session.get("liked_posts", []))
    str_post_id = str(post_id)

    if str_post_id in liked_posts:
        post.likes = max(0, post.likes - 1)
        liked_posts.remove(str_post_id)
    else:
        post.likes += 1
        liked_posts.add(str_post_id)

    post.save()
    request.session["liked_posts"] = list(liked_posts)
    request.session.modified = True
    return JsonResponse({"id": post.id, "likes": post.likes, "dislikes": post.dislikes})


@csrf_exempt
def toggle_dislike(request, post_id):
    post = get_object_or_404(Post, id=post_id)
    disliked_posts = set(request.session.get("disliked_posts", []))
    str_post_id = str(post_id)

    if str_post_id in disliked_posts:
        post.dislikes = max(0, post.dislikes - 1)
        disliked_posts.remove(str_post_id)
    else:
        post.dislikes += 1
        disliked_posts.add(str_post_id)

    post.save()
    request.session["disliked_posts"] = list(disliked_posts)
    request.session.modified = True
    return JsonResponse({"id": post.id, "likes": post.likes, "dislikes": post.dislikes})


# комментарии
class CommentPagination(PageNumberPagination):
    page_size = 3
    page_size_query_param = "page_size"
    max_page_size = 100


class CommentListView(ListAPIView):
    serializer_class = CommentSerializer
    pagination_class = CommentPagination

    def get_queryset(self):
        post_id = self.kwargs["post_id"]
        return Comment.objects.filter(post_id=post_id).order_by("-created_at")


class CommentCreateView(CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        post_id = self.kwargs["post_id"]
        serializer.save(user=self.request.user, post_id=post_id)


class CommentDeleteView(DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(user=self.request.user)


# регистрация
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Username и password обязательны."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Такой пользователь уже есть."}, status=status.HTTP_400_BAD_REQUEST)

        User.objects.create_user(username=username, password=password)
        return Response({"message": "Регистрация успешна."}, status=status.HTTP_201_CREATED)