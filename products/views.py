from django.shortcuts import render
from django.db.models import Q
from rest_framework import generics, filters
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters

from .models import Product
from .serializers import ProductSerializer


class ProductFilter(django_filters.FilterSet):
    """Фильтры для товаров"""
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    min_rating = django_filters.NumberFilter(field_name="rating", lookup_expr='gte')
    min_reviews = django_filters.NumberFilter(field_name="reviews_count", lookup_expr='gte')
    
    class Meta:
        model = Product
        fields = ['min_price', 'max_price', 'min_rating', 'min_reviews']


class ProductListAPIView(generics.ListAPIView):
    """API для получения списка товаров с фильтрацией"""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = ProductFilter
    ordering_fields = ['price', 'rating', 'reviews_count', 'name', 'created_at']
    ordering = ['-created_at']
    search_fields = ['name']


@api_view(['GET'])
def analytics_data(request):
    """API для получения аналитических данных для графиков"""
    products = Product.objects.all()
    
    # Данные для гистограммы цен
    price_ranges = [
        {'min': 0, 'max': 1000, 'label': '0-1000'},
        {'min': 1000, 'max': 5000, 'label': '1000-5000'},
        {'min': 5000, 'max': 10000, 'label': '5000-10000'},
        {'min': 10000, 'max': 20000, 'label': '10000-20000'},
        {'min': 20000, 'max': 50000, 'label': '20000-50000'},
        {'min': 50000, 'max': 999999, 'label': '50000+'},
    ]
    
    price_distribution = []
    for price_range in price_ranges:
        count = products.filter(
            price__gte=price_range['min'],
            price__lt=price_range['max']
        ).count()
        price_distribution.append({
            'range': price_range['label'],
            'count': count
        })
    
    # Данные для графика "скидка vs рейтинг"
    discount_rating_data = []
    for product in products.filter(rating__isnull=False, discounted_price__isnull=False):
        discount_rating_data.append({
            'discount_amount': float(product.discount_amount),
            'rating': float(product.rating),
            'name': product.name
        })
    
    return Response({
        'price_distribution': price_distribution,
        'discount_rating_data': discount_rating_data,
        'total_products': products.count()
    })


def index(request):
    """Главная страница с фронтендом"""
    return render(request, 'index.html')
