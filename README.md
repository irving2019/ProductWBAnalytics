# Product Analytics

Веб-приложение для анализа товаров с Wildberries с возможностью парсинга данных и их визуализации.

## Описание

Проект представляет собой полноценную систему аналитики товаров, включающую:
- Парсинг данных с маркетплейса Wildberries
- REST API для работы с данными
- Веб-интерфейс с фильтрацией и сортировкой
- Интерактивные графики и диаграммы

## Технологии

- **Backend:** Django, Django REST Framework
- **Frontend:** HTML/CSS/JavaScript, Bootstrap 5
- **База данных:** SQLite
- **Графики:** Chart.js
- **Парсинг:** requests, beautifulsoup4

## Установка

### Обычная установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/irving2019/ProductWBAnalytics.git
cd ProductWBAnalytics
```

2. Создайте виртуальное окружение:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# или
source venv/bin/activate  # Linux/Mac
```

3. Установите зависимости:
```bash
pip install -r requirements.txt
```

4. Выполните миграции:
```bash
python manage.py migrate
```

5. Создайте суперпользователя:
```bash
python manage.py createsuperuser
```

### Установка с Docker

1. Клонируйте репозиторий:
```bash
git clone https://github.com/irving2019/ProductWBAnalytics.git
cd ProductWBAnalytics
```

2. Запустите контейнеры:
```bash
docker-compose up --build
```

Приложение будет доступно по адресу: http://localhost:8000/

### Установка с Docker (production)

Для production используйте отдельный docker-compose файл с настройками безопасности.

## Запуск

### Обычный запуск

```bash
python manage.py runserver
```

### Запуск с Docker

```bash
docker-compose up
```

Приложение будет доступно по адресу: http://127.0.0.1:8000/ (обычный запуск) или http://localhost:8000/ (Docker)

## Использование

### Парсинг данных

Для загрузки товаров с Wildberries используйте команду:

**Обычный запуск:**
```bash
python manage.py parse_wildberries "поисковый запрос" --pages 3
```

**Docker:**
```bash
docker-compose exec web python manage.py parse_wildberries "поисковый запрос" --pages 3
```

Примеры:
```bash
# Обычный запуск
python manage.py parse_wildberries "смартфон" --pages 2
python manage.py parse_wildberries "ноутбук" --pages 1
python manage.py parse_wildberries "наушники" --pages 3

# Docker
docker-compose exec web python manage.py parse_wildberries "смартфон" --pages 2
docker-compose exec web python manage.py parse_wildberries "ноутбук" --pages 1
```

### API Endpoints

- `GET /api/products/` - получение списка товаров
- `GET /api/analytics/` - аналитические данные для графиков

Параметры фильтрации:
- `min_price`, `max_price` - диапазон цен
- `min_rating` - минимальный рейтинг
- `min_reviews` - минимальное количество отзывов
- `search` - поиск по названию
- `ordering` - сортировка

Пример запроса:
```
GET /api/products/?min_price=5000&min_rating=4&ordering=-price
```

### Веб-интерфейс

Основные возможности:
- Просмотр таблицы товаров с пагинацией
- Фильтрация по цене, рейтингу, количеству отзывов
- Поиск по названию товара
- Сортировка по всем полям
- Графики распределения цен и зависимости скидок от рейтинга

## Структура проекта

```
ProductAnalytics/
├── config/                 # Настройки Django
├── products/               # Основное приложение
│   ├── models.py          # Модели данных
│   ├── views.py           # API и представления
│   ├── serializers.py     # Сериализаторы
│   └── management/
│       └── commands/
│           └── parse_wildberries.py  # Команда парсинга
├── templates/              # HTML шаблоны
├── static/                 # CSS/JS файлы
├── requirements.txt        # Зависимости
├── Dockerfile             # Docker конфигурация
├── docker-compose.yml     # Docker Compose
├── .env.docker           # Переменные окружения для Docker
└── manage.py
```

## Модель данных

Товар (Product):
- name - название
- price - цена
- discounted_price - цена со скидкой
- rating - рейтинг
- reviews_count - количество отзывов
- url - ссылка на товар
- created_at/updated_at - даты

## Настройка окружения

Скопируйте `.env.example` в `.env` и настройте переменные:

```bash
cp .env.example .env
```

Отредактируйте `.env`:
```
SECRET_KEY=ваш-секретный-ключ
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
EMAIL_HOST_USER=ваш-email@gmail.com
EMAIL_HOST_PASSWORD=пароль-приложения
```

## Админка

Админ-панель доступна по адресу: http://127.0.0.1:8000/admin/

Возможности:
- Управление товарами
- Фильтрация и поиск
- Массовые операции
- Просмотр статистики