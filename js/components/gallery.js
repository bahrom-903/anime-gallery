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
        btn.className = "category-button"; // Используем новый правильный класс
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
        elements.galleryContainer.innerHTML = `<p>${t('status_loading_gallery')}</p>`;
        
        let galleryItems = await db.getByIndex(DB_CONFIG.STORES.GALLERY, 'category', reactive.currentCategory);

        if (reactive.isFavFilterActive) {
            galleryItems = galleryItems.filter(item => item.favorite);
        }

        const sortType = reactive.currentSort;
        if (sortType === 'date_asc') {
            galleryItems.sort((a, b) => a.id - b.id);
        } else if (sortType === 'date_desc') {
            galleryItems.sort((a, b) => b.id - a.id);
        } else if (sortType === 'random') {
            galleryItems.sort(() => Math.random() - 0.5);
        }

        elements.galleryContainer.innerHTML = '';
        
        if (galleryItems.length === 0) {
            elements.galleryContainer.innerHTML = `<p class="empty-gallery-message">${t('status_gallery_empty')}</p>`;
            elements.selectionControls.classList.add('hidden');
            return;
        }

        elements.selectionControls.classList.remove('hidden');
        galleryItems.forEach(createGalleryItem);

    } catch (error) {
        console.error('Ошибка при рендере галереи:', error);
        elements.galleryContainer.innerHTML = `<p class="error-message">${t('error_gallery_load')}</p>`;
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

    controls.append(cb, fav, menuBtn);
    item.append(img, controls);
    elements.galleryContainer.appendChild(item);
}


// --- Обработчики и логика ---

function handleCategoryClick(categoryId) {
    updateState({ currentCategory: categoryId });
    localStorage.setItem('currentCategory', categoryId);
    renderCategories();
    renderGallery();
}

async function toggleFavorite(id, isFavorite) {
    try {
        const entry = await db.get(DB_CONFIG.STORES.GALLERY, id);
        if (entry) {
            entry.favorite = isFavorite;
            await db.put(DB_CONFIG.STORES.GALLERY, entry);
            await renderGallery();
        }
    } catch (error) {
        console.error('Ошибка при изменении статуса избранного:', error);
    }
}

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
        if (newEntry.category === reactive.currentCategory) {
            await renderGallery();
        }
    } catch (error) {
        console.error('Ошибка сохранения в галерею:', error);
    }
}

export function initializeGallery() {
    const savedCategory = localStorage.getItem('currentCategory') || 'waifu';
    updateState({ currentCategory: savedCategory });
    
    renderCategories();
    renderGallery();
}
