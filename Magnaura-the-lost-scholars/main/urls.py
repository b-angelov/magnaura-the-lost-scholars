from django.urls import path
from . import views

urlpatterns = [
    path('api/start_game/', views.start_game, name='start_game'),
    path('api/move/', views.move, name='move'),
    path('api/get_puzzle/', views.get_puzzle, name='get_puzzle'),
    path('api/solve_puzzle/', views.solve_puzzle, name='solve_puzzle'),
    path('api/auth/login/', views.login, name='login'),
    path('api/auth/register/', views.register, name='register'),
    path('api/get_level/', views.get_level, name='get_level'),
]