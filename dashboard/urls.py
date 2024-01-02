from django.urls import path
from .views import dashboard

urlpatterns = [
    path('', view=dashboard),
    path('dashboard/', view=dashboard),
]