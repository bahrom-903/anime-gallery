/**
 * js/components/gallery.js
 * 
 * Логика компонента "Галерея". Отвечает за рендеринг категорий,
 * отображение изображений из IndexedDB, сортировку и фильтрацию.
 */

import * as elements from '../elements.js';
import { reactive, updateState, CATEGORIES } from '../state.js';
import * as db from '../core/db.js';
import { DB_CONFIG } from '../state.js';
import { t } from '../core/i18n.js';

// --- Функции рендеринга ---

/**
 * Отрисовывает кнопки категорий.
 */
function renderCategories() {
    elements.categoryControls.innerHTML = '';
    for (const id of Object.keys(CATEGORIES)) {
        const btn = document.createElement('button');
        btn.dataset.categoryId = id;
        btn.textContent = t(`cat_${id}`);
        if (id === reactive.currentCategory) {
            btn.classList.add('active-category');
        }
        btn.addEventListener('click', () => handleCategoryClick(id));
        elements.categoryControls.appendChild(btn);
    }
}

/**
 * Отрисовывает галерею на основе текущей категории, сортировки и фильтров.
 */
export async function renderGallery() {
    try {
        elements.galleryContainer.innerHTML = 'Загрузка галереи...'; // TODO: Перевести
        
        let galleryItems = await db.getByIndex(DB_CONFIG.STORES.GALLERY, 'category', reactive.currentCategory);

        // Фильтр по избранному
        if (reactive.isFavFilterActive) {
            galleryItems = galleryItems.filter(item => item.favorite);
        }

        // Сортировка
        const sortType = reactive.currentSort;
        if (sortType === 'date_asc') {
            galleryItems.sort((a, b) => a.id - b.id);
        } else if (sortType === 'date_desc') {
            galleryItems.sort((a, b) => b.id - a.id);
        } else if (sortType === 'random') {
            galleryItems.sort(() => Math.random() - 0.5);
        }

        elements.galleryContainer.innerHTML = ''; // Очищаем перед рендером
        
        if (galleryItems.length === 0) {
            elements.galleryContainer.textContent = 'В этой категории пока нет изображений.'; // TODO: Перевести
            elements.selectionControls.classList.add('hidden');
            return;
        }

        elements.selectionControls.classList.remove('hidden');
        galleryItems.forEach(createGalleryItem);

    } catch (error) {
        console.error('Ошибка при рендере галереи:', error);
        elements.galleryContainer.textContent = 'Не удалось загрузить галерею.'; // TODO: Перевести
    }
}

/**
 * Создает и добавляет один элемент (картинку) в галерею.
 * @param {object} entry - Данные изображения из БД.
 */
function createGalleryItem(entry) {
    const item = document.createElement('div');
    item.className = "gallery-item";
    item.dataset.id = entry.id;

    const img = document.createElement('img');
    img.src = entry.data;
    img.loading = "lazy";
    img.alt = entry.prompt;
    // img.addEventListener('dblclick', () => viewImage(entry.data)); // TODO: Подключить viewer

    const controls = document.createElement('div');
    controls.className = 'item-controls';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'select-checkbox';

    const fav = document.createElement('div');
    fav.innerText = entry.favorite ? '⭐' : '☆';
    fav.className = 'favorite-star';
    fav.title = "Добавить в избранное";
    fav.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(entry.id, !entry.favorite);
    });

    const menuBtn = document.createElement('button');
    menuBtn.className = 'item-menu-btn';
    menuBtn.innerHTML = '⋮';
    // menuBtn.addEventListener('click', ...); // TODO: Подключить контекстное меню

    controls.append(cb, fav, menuBtn);
    item.append(img, controls);
    elements.galleryContainer.appendChild(item);
}


// --- Обработчики и логика ---

/**
 * Обрабатывает клик по кнопке категории.
 * @param {string} categoryId - ID выбранной категории.
 */
function handleCategoryClick(categoryId) {
    updateState({ currentCategory: categoryId });
    // Сохраняем выбор в localStorage для следующего визита
    localStorage.setItem('currentCategory', categoryId);
    renderCategories(); // Перерисовываем кнопки, чтобы подсветить активную
    renderGallery(); // Перерисовываем галерею для новой категории
}

/**
 * Переключает статус "избранное" для изображения.
 * @param {number} id - ID изображения.
 * @param {boolean} isFavorite - Новый статус.
 */
async function toggleFavorite(id, isFavorite) {
    try {
        const entry = await db.get(DB_CONFIG.STORES.GALLERY, id);
        if (entry) {
            entry.favorite = isFavorite;
            await db.put(DB_CONFIG.STORES.GALLERY, entry);
            await renderGallery(); // Перерисовываем, чтобы обновить звездочку
        }
    } catch (error) {
        console.error('Ошибка при изменении статуса избранного:', error);
    }
}

/**
 * Добавляет новое изображение в галерею.
 * Эта функция будет вызываться из других модулей (например, из generator.js).
 * @param {string} dataUrl - Изображение в формате Base64.
 * @param {string} prompt - Промпт.
 * @param {boolean} isAi - Флаг AI-генерации.
 */
export async function addImageToGallery(dataUrl, prompt, isAi) {
    const newEntry = {
        id: Date.now(),
        prompt: prompt || `image_${Date.now()}`,
        data: dataUrl,
        favorite: false,
        date: new Date().toISOString(),
        category: reactive.currentCategory,
        isAiGenerated: !!isAi
    };

    try {
        await db.put(DB_CONFIG.STORES.GALLERY, newEntry);
        // Если новая картинка добавлена в текущую активную категорию, обновляем галерею
        if (newEntry.category === reactive.currentCategory) {
            await renderGallery();
        }
    } catch (error) {
        console.error('Ошибка сохранения в галерею:', error);
        // TODO: Показать ошибку пользователю
    }
}

/**
 * Инициализация компонента "Галерея".
 */
export function initializeGallery() {
    // Загружаем последнюю активную категорию из localStorage
    const savedCategory = localStorage.getItem('currentCategory') || 'waifu';
    updateState({ currentCategory: savedCategory });
    
    renderCategories();
    renderGallery();
    
    // TODO: Добавить обработчики на кнопки 'Загрузить', 'Экспорт' и т.д.
}
