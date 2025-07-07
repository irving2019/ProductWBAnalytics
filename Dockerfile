FROM python:3.11-slim

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Копирование файлов зависимостей
COPY requirements.txt .

# Установка Python зависимостей
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода приложения
COPY . .

# Создание директории для статических файлов
RUN mkdir -p staticfiles

# Открытие порта
EXPOSE 8000

# Создание entrypoint скрипта
RUN echo '#!/bin/bash\npython manage.py migrate\npython manage.py collectstatic --noinput\npython manage.py runserver 0.0.0.0:8000' > /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Команда запуска
CMD ["/app/entrypoint.sh"]
