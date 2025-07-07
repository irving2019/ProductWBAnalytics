from django.db import models


class Product(models.Model):
    """Модель товара с Wildberries"""
    
    name = models.CharField(max_length=500, verbose_name="Название товара")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена")
    discounted_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True, 
        verbose_name="Цена со скидкой"
    )
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        null=True, 
        blank=True, 
        verbose_name="Рейтинг"
    )
    reviews_count = models.IntegerField(default=0, verbose_name="Количество отзывов")
    url = models.URLField(max_length=1000, null=True, blank=True, verbose_name="Ссылка на товар")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата добавления")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def discount_amount(self):
        """Размер скидки"""
        if self.discounted_price and self.price:
            return self.price - self.discounted_price
        return 0

    @property
    def discount_percentage(self):
        """Процент скидки"""
        if self.discounted_price and self.price and self.price > 0:
            return ((self.price - self.discounted_price) / self.price) * 100
        return 0
