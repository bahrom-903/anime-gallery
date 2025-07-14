/**
 * js/components/gallery.js (v3 - Dependency Injection)
 */
// БОЛЬШЕ НЕТ 'import * as elements'

import { reactive, updateState, CATEGORIES, DB_CONFIG } from '../state.js';
import * as db from '../core/db.js';
import { t } from '../core/i18n.js';

// --- Функции рендеринга ---
function renderCategories(elements) {
    elements.categoryControls.innerHTML = '';
    for (const id of Object.keys(CATEGORIES)) {
        const btn = document.createElement('button');
        btn.className = "category-button";
        btn.dataset.categoryId = id;
        btn.textContent = t(`cat_${id}`);
        if (id === reactive.currentCategory) btn.classList.add('active-category');
        btn.addEventListener('click', () => handleCategoryClick(elements, id));
        elements.categoryControls.appendChild(btn);
    }
}

export async function renderGallery(elements) {
    try {
        elements.galleryContainer.innerHTML = `<p>${t('status_loading_gallery')}</p>`;
        let galleryItems = await db.getByIndex(DB_CONFIG.STORES.GALLERY, 'category', reactive.currentCategory);
        // ... остальная логика сортировки и фильтрации ...
        elements.galleryContainer.innerHTML = '';
        if (galleryItems.length === 0) {
            elements.galleryContainer.innerHTML = `<p class="empty-gallery-message">${t('status_gallery_empty')}</p>`;
            elements.selectionControls.classList.add('hidden');
            return;
        }
        elements.selectionControls.classList.remove('hidden');
        galleryItems.forEach(entry => createGalleryItem(elements, entry));
    } catch (error) {
        elements.galleryContainer.innerHTML = `<p class="error-message">${t('error_gallery_load')}</p>`;
    }
}

function createGalleryItem(elements, entry) {
    // ... логика создания элемента ...
    // В обработчиках событий также нужно передавать 'elements' при необходимости
    fav.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(elements, entry.id, !entry.favorite);
    });
    elements.galleryContainer.appendChild(item);
}

// --- Обработчики и логика ---
function handleCategoryClick(elements, categoryId) {
    updateState({ currentCategory: categoryId });
    localStorage.setItem('currentCategory', categoryId);
    renderCategories(elements);
    renderGallery(elements);
}

async function toggleFavorite(elements, id, isFavorite) {
    const entry = await db.get(DB_CONFIG.STORES.GALLERY, id);
    if (entry) {
        entry.favorite = isFavorite;
        await db.put(DB_CONFIG.STORES.GALLERY, entry);
        await renderGallery(elements);
    }
}

export async function addImageToGallery(dataUrl, prompt, isAi) {
    // Эта функция не трогает DOM напрямую, поэтому ей не нужны 'elements'
    // ... код без изменений ...
}

// ГЛАВНОЕ ИЗМЕНЕНИЕ: Функция инициализации теперь ПРИНИМАЕТ 'elements'
export function initializeGallery(elements) {
    const savedCategory = localStorage.getItem('currentCategory') || 'waifu';
    updateState({ currentCategory: savedCategory });
    renderCategories(elements);
    renderGallery(elements);
}
