// Глобальные переменные
let currentPage = 1;
let currentFilters = {};
let priceChart = null;
let discountChart = null;
let priceSlider = null;

// API URLs
const API_BASE = '/api';
const PRODUCTS_API = `${API_BASE}/products/`;
const ANALYTICS_API = `${API_BASE}/analytics/`;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializePriceSlider();
    loadProducts();
    loadAnalytics();
    bindEventListeners();
});

// Инициализация слайдера цен
function initializePriceSlider() {
    const slider = document.getElementById('price-slider');
    
    priceSlider = noUiSlider.create(slider, {
        start: [0, 100000],
        connect: true,
        range: {
            'min': 0,
            'max': 100000
        },
        format: {
            to: function (value) {
                return Math.round(value);
            },
            from: function (value) {
                return Math.round(value);
            }
        }
    });

    // Обновление полей ввода при изменении слайдера
    priceSlider.on('update', function (values, handle) {
        document.getElementById('min-price').value = values[0];
        document.getElementById('max-price').value = values[1];
    });

    // Обновление слайдера при изменении полей ввода
    document.getElementById('min-price').addEventListener('change', function() {
        priceSlider.set([this.value, null]);
    });

    document.getElementById('max-price').addEventListener('change', function() {
        priceSlider.set([null, this.value]);
    });
}

// Привязка обработчиков событий
function bindEventListeners() {
    // Применение фильтров
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    
    // Сброс фильтров
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
    
    // Сортировка
    document.getElementById('sort-by').addEventListener('change', function() {
        currentFilters.ordering = this.value;
        loadProducts();
    });
    
    // Поиск по Enter
    document.getElementById('search').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
}

// Применение фильтров
function applyFilters() {
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;
    const minRating = document.getElementById('min-rating').value;
    const minReviews = document.getElementById('min-reviews').value;
    const search = document.getElementById('search').value;
    const ordering = document.getElementById('sort-by').value;

    currentFilters = {};
    
    if (minPrice) currentFilters.min_price = minPrice;
    if (maxPrice) currentFilters.max_price = maxPrice;
    if (minRating) currentFilters.min_rating = minRating;
    if (minReviews) currentFilters.min_reviews = minReviews;
    if (search) currentFilters.search = search;
    if (ordering) currentFilters.ordering = ordering;
    
    currentPage = 1;
    loadProducts();
    loadAnalytics();
}

// Сброс фильтров
function resetFilters() {
    // Сброс полей формы
    document.getElementById('min-rating').value = '';
    document.getElementById('min-reviews').value = '';
    document.getElementById('search').value = '';
    document.getElementById('sort-by').value = '-created_at';
    
    // Сброс слайдера цен
    priceSlider.set([0, 100000]);
    
    // Сброс фильтров и загрузка данных
    currentFilters = {};
    currentPage = 1;
    loadProducts();
    loadAnalytics();
}

// Загрузка списка товаров
async function loadProducts() {
    try {
        showLoading();
        
        const params = new URLSearchParams({
            page: currentPage,
            ...currentFilters
        });
        
        const response = await fetch(`${PRODUCTS_API}?${params}`);
        const data = await response.json();
        
        renderProductsTable(data.results);
        renderPagination(data);
        updateTotalProducts(data.count);
        
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        showError('Ошибка загрузки данных');
    }
}

// Отображение таблицы товаров
function renderProductsTable(products) {
    const tbody = document.getElementById('products-table');
    
    if (!products || products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <i class="fas fa-inbox fa-2x text-muted mb-2"></i>
                    <p class="text-muted">Товары не найдены</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr class="fade-in">
            <td>
                <div class="product-name" title="${escapeHtml(product.name)}">
                    ${escapeHtml(product.name)}
                </div>
                ${product.url ? `<small><a href="${product.url}" target="_blank" class="text-primary">Перейти к товару</a></small>` : ''}
            </td>
            <td>
                ${product.discounted_price ? `<span class="price-original">${formatPrice(product.price)}</span><br>` : ''}
                <span class="${product.discounted_price ? 'price-discounted' : ''}">${formatPrice(product.discounted_price || product.price)}</span>
            </td>
            <td>
                ${product.discounted_price ? formatPrice(product.discounted_price) : '—'}
            </td>
            <td>
                ${product.rating ? `<span class="rating-stars">${'★'.repeat(Math.floor(product.rating))}</span> ${product.rating}` : '—'}
            </td>
            <td>
                <span class="badge bg-secondary">${product.reviews_count}</span>
            </td>
            <td>
                ${product.discount_percentage > 0 ? `<span class="discount-badge">-${product.discount_percentage.toFixed(0)}%</span>` : '—'}
            </td>
        </tr>
    `).join('');
}

// Отображение пагинации
function renderPagination(data) {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(data.count / 20); // PAGE_SIZE = 20
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Предыдущая страница
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Предыдущая</a>
        </li>
    `;
    
    // Номера страниц
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }
    
    // Следующая страница
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Следующая</a>
        </li>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Смена страницы
function changePage(page) {
    if (page < 1) return;
    currentPage = page;
    loadProducts();
}

// Обновление счетчика товаров
function updateTotalProducts(count) {
    document.getElementById('total-products').textContent = `Найдено товаров: ${count}`;
}

// Загрузка аналитических данных
async function loadAnalytics() {
    try {
        const params = new URLSearchParams(currentFilters);
        const response = await fetch(`${ANALYTICS_API}?${params}`);
        const data = await response.json();
        
        renderPriceChart(data.price_distribution);
        renderDiscountChart(data.discount_rating_data);
        
    } catch (error) {
        console.error('Ошибка загрузки аналитики:', error);
    }
}

// Отображение гистограммы цен
function renderPriceChart(data) {
    const ctx = document.getElementById('price-chart').getContext('2d');
    
    if (priceChart) {
        priceChart.destroy();
    }
    
    priceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.range),
            datasets: [{
                label: 'Количество товаров',
                data: data.map(item => item.count),
                backgroundColor: 'rgba(0, 123, 255, 0.6)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Распределение товаров по ценовым диапазонам'
                }
            }
        }
    });
}

// Отображение графика скидки vs рейтинг
function renderDiscountChart(data) {
    const ctx = document.getElementById('discount-chart').getContext('2d');
    
    if (discountChart) {
        discountChart.destroy();
    }
    
    discountChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Товары',
                data: data.map(item => ({
                    x: item.rating,
                    y: item.discount_amount
                })),
                backgroundColor: 'rgba(220, 53, 69, 0.6)',
                borderColor: 'rgba(220, 53, 69, 1)',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Рейтинг'
                    },
                    min: 0,
                    max: 5
                },
                y: {
                    title: {
                        display: true,
                        text: 'Размер скидки (₽)'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Зависимость размера скидки от рейтинга'
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const point = data[context.dataIndex];
                            return `Товар: ${point.name}`;
                        }
                    }
                }
            }
        }
    });
}

// Вспомогательные функции
function showLoading() {
    document.getElementById('products-table').innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
            </td>
        </tr>
    `;
}

function showError(message) {
    document.getElementById('products-table').innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <i class="fas fa-exclamation-triangle fa-2x text-danger mb-2"></i>
                <p class="text-danger">${message}</p>
            </td>
        </tr>
    `;
}

function formatPrice(price) {
    if (!price) return '—';
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
