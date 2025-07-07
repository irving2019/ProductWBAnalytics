from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/products/', views.ProductListAPIView.as_view(), name='products-api'),
    path('api/analytics/', views.analytics_data, name='analytics-api'),
]
