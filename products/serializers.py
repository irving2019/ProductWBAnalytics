from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    discount_amount = serializers.ReadOnlyField()
    discount_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 
            'name', 
            'price', 
            'discounted_price', 
            'rating', 
            'reviews_count', 
            'url', 
            'discount_amount',
            'discount_percentage',
            'created_at', 
            'updated_at'
        ]
