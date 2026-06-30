from django.urls import path

from decomposer import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("decompose/", views.decompose, name="decompose"),
]
