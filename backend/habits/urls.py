from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("api/summary/", views.summary_api, name="summary_api"),
    path("api/rows/<int:row_id>/comment/", views.update_row_comment_api, name="update_row_comment_api"),
    path("api/rows/<int:row_id>/check/", views.update_row_check_api, name="update_row_check_api"),
    path("api/habits/", views.create_habit_api, name="create_habit_api"),
    path("api/habits/<int:habit_id>/", views.delete_habit_api, name="delete_habit_api"),

]