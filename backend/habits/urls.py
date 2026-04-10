from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("api/summary/", views.summary_api, name="summary_api"),
    path("api/rows/", views.create_row_api, name="create_row_api"),
    path("api/rows/<int:row_id>/comment/", views.update_row_comment_api, name="update_row_comment_api"),
]