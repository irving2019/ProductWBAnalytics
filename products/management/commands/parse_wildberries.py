import requests
import time
import random
from django.core.management.base import BaseCommand
from products.models import Product


class WildberriesParser:
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def search_products(self, query, max_pages=3):
        products = []
        
        for page in range(1, max_pages + 1):
            print(f"Парсинг страницы {page}...")
            
            url = f"https://search.wb.ru/exactmatch/ru/common/v4/search"
            params = {
                'appType': '1',
                'curr': 'rub',
                'dest': '-1257786',
                'query': query,
                'resultset': 'catalog',
                'sort': 'popular',
                'spp': '27',
                'suppressSpellcheck': 'false',
                'page': page
            }
            
            try:
                response = self.session.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                
                if 'data' not in data or 'products' not in data['data']:
                    print("Нет данных о товарах")
                    break
                
                for item in data['data']['products']:
                    product_data = self._parse_product(item)
                    if product_data:
                        products.append(product_data)
                
                time.sleep(random.uniform(1, 3))
                
            except Exception as e:
                print(f"Ошибка при парсинге страницы {page}: {e}")
                continue
        
        return products
    
    def _parse_product(self, item):
        try:
            name = item.get('name', '')
            if not name:
                return None
            
            price_data = item.get('priceU', 0)
            price = price_data / 100 if price_data else 0
            
            sale_price_data = item.get('salePriceU')
            discounted_price = sale_price_data / 100 if sale_price_data else None
            
            rating = item.get('rating')
            reviews_count = item.get('feedbacks', 0)
            
            product_id = item.get('id')
            url = f"https://www.wildberries.ru/catalog/{product_id}/detail.aspx" if product_id else None
            
            return {
                'name': name,
                'price': price,
                'discounted_price': discounted_price,
                'rating': rating,
                'reviews_count': reviews_count,
                'url': url
            }
            
        except Exception as e:
            print(f"Ошибка при парсинге товара: {e}")
            return None
    
    def save_products(self, products_data):
        saved_count = 0
        
        for product_data in products_data:
            try:
                existing_product = Product.objects.filter(
                    name=product_data['name'],
                    price=product_data['price']
                ).first()
                
                if not existing_product:
                    Product.objects.create(**product_data)
                    saved_count += 1
                    print(f"Сохранен товар: {product_data['name']}")
                else:
                    print(f"Товар уже существует: {product_data['name']}")
                    
            except Exception as e:
                print(f"Ошибка при сохранении товара {product_data.get('name', 'Unknown')}: {e}")
        
        return saved_count


class Command(BaseCommand):
    help = 'Парсинг товаров с Wildberries'
    
    def add_arguments(self, parser):
        parser.add_argument('query', type=str, help='Поисковый запрос')
        parser.add_argument('--pages', type=int, default=3, help='Количество страниц для парсинга')
    
    def handle(self, *args, **options):
        query = options['query']
        max_pages = options['pages']
        
        self.stdout.write(f"Начинаем парсинг товаров по запросу: {query}")
        
        parser = WildberriesParser()
        products = parser.search_products(query, max_pages)
        
        if products:
            saved_count = parser.save_products(products)
            self.stdout.write(
                self.style.SUCCESS(
                    f"Парсинг завершен. Найдено товаров: {len(products)}, "
                    f"сохранено новых: {saved_count}"
                )
            )
        else:
            self.stdout.write(self.style.WARNING("Товары не найдены"))
