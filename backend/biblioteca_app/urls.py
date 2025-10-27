from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'libros', views.LibroViewSet)
router.register(r'categorias', views.CategoriaViewSet)
router.register(r'bibliotecario', views.BibliotecarioViewSet, basename='bibliotecario')
router.register(r'consultas', views.ConsultaViewSet)
router.register(r'reservas', views.ReservaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
