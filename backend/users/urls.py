from django.urls import path

from . import views

urlpatterns = [
    path("api/register/", views.register_api, name="register_api"),
    path("api/login/", views.login_api, name="login_api"),
    path("api/logout/", views.logout_api, name="logout_api"),
    path("api/me/", views.me_api, name="me_api"),
]
