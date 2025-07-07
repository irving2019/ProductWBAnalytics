from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'discounted_price', 'rating', 'reviews_count', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 20
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'url')
        }),
        ('Цены', {
            'fields': ('price', 'discounted_price')
        }),
        ('Рейтинг и отзывы', {
            'fields': ('rating', 'reviews_count')
        }),
        ('Даты', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
