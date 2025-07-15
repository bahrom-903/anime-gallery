// ===================================
//      Файл: ui.js ⭐ ВЕРСИЯ 5.0 (ФИНАЛЬНЫЙ РЕФАКТОРИНГ UI) ⭐
// ===================================
import { THEMES, STYLES, CATEGORIES } from './config.js';
import { getState, setState } from './state.js';
import { dbRequest } from './db.js';

// ⭐ НОВЫЕ SVG-ИКОНКИ ⭐
const ICONS = {
    back: `<svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>`,
    reset: `<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>`,
    close: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>`
};

const setupPanelIcons = () => {
    document.querySelectorAll('.panel-back-btn').forEach(btn => btn.innerHTML = ICONS.back);
    document.querySelectorAll('.panel-reset-btn').forEach(btn => btn.innerHTML = ICONS.reset);
    document.querySelectorAll('.panel-close-btn').forEach(btn => btn.innerHTML = ICONS.close);
}

export const renderThemes = (elements, applyThemeHandler) => {
    elements.themeGrid.innerHTML = '';
    THEMES.forEach(item => {
        const card = document.createElement("div");
        card.className = "preview-card";
        card.dataset.theme = item.id;
        const name = item.id.charAt(0).toUpperCase() + item.id.slice(1).replace(/_/g, ' ');
        // ⭐ Добавляем класс темы прямо в preview-box, чтобы стили не наследовались
        card.innerHTML = `<div class="preview-box theme-${item.id}"></div><div class="preview-name">${name}</div>`;
        card.addEventListener('click', () => applyThemeHandler(item.id));
        elements.themeGrid.appendChild(card);
    });
};

export const renderSortAndFilterOptions = (elements, translations, handlers) => {
    if (!elements.sortControls || !elements.filterControls || !elements.selectionControls) return;

    // Очищаем контейнеры
    elements.sortControls.innerHTML = '';
    elements.filterControls.innerHTML = '';
    elements.selectionButtons.innerHTML = '';
    const langPack = translations[getState().currentLanguage] || translations.ru;
    
    // 1. Кнопки сортировки
    const sortOptions = { 'date_desc': langPack.sort_newest, 'date_asc': langPack.sort_oldest, 'random': langPack.sort_random };
    for (const [key, value] of Object.entries(sortOptions)) {
        const button = document.createElement('button');
        button.className = 'text-like-button';
        if (key === getState().currentSort) button.classList.add('active-sort');
        button.textContent = value;
        button.addEventListener('click', () => handlers.handleSort(key));
        elements.sortControls.appendChild(button);
    }
    
    // 2. Кнопка фильтра "Избранное"
    const favButton = document.createElement('button');
    favButton.className = 'text-like-button';
    favButton.textContent = `✅ ${langPack.sort_favorites}`;
    if (getState().isFavFilterActive) favButton.classList.add('active-sort');
    favButton.addEventListener('click', () => handlers.handleSort('filter_favorite'));
    elements.filterControls.appendChild(favButton);

    // 3. Кнопки выбора
    const selectAllBtn = document.createElement('button');
    selectAllBtn.className = 'text-like-button';
    selectAllBtn.textContent = langPack.select_all_label;
    selectAllBtn.addEventListener('click', () => handlers.selectAllItems(true));
    
    const selectAiBtn = document.createElement('button');
    selectAiBtn.className = 'text-like-button';
    selectAiBtn.textContent = langPack.select_ai_only_label;
    selectAiBtn.addEventListener('click', handlers.selectAiItems);

    elements.selectionButtons.append(selectAllBtn, selectAiBtn);
};

export const renderGallery = async (elements, handlers) => {
    try {
        const allGalleryData = await dbRequest('gallery', 'readonly', store => store.getAll());
        elements.galleryContainer.innerHTML = "";
        const categoryData = allGalleryData.filter(item => item.category === getState().currentCategory);
        
        // ⭐ УЛУЧШЕННАЯ ЛОГИКА ФИЛЬТРАЦИИ ⭐
        let dataToRender = [...categoryData];
        if (getState().isFavFilterActive) {
            const favoritesInCategory = categoryData.filter(e => e.favorite);
            // Если мы в режиме "избранное", показываем только их.
            // Если их нет, dataToRender останется пустым, и мы покажем сообщение.
            dataToRender = favoritesInCategory;
        }

        const sortType = getState().currentSort;
        if (sortType === 'date_asc') dataToRender.sort((a, b) => a.id - b.id);
        else if (sortType === 'date_desc') dataToRender.sort((a, b) => b.id - a.id);
        else if (sortType === 'random') dataToRender.sort(() => Math.random() - 0.5);

        elements.selectionAndSortControls.classList.toggle('hidden', categoryData.length === 0);

        if (dataToRender.length === 0) {
            if (getState().isFavFilterActive) {
                 elements.galleryContainer.innerHTML = `<p class="error" data-lang-key="no_favorites_in_category">В этой категории нет избранных изображений.</p>`;
            } else if (categoryData.length > 0) {
                // Этого не должно случиться, но на всякий случай
                elements.galleryContainer.innerHTML = `<p class="error">Нет данных для отображения.</p>`;
            } else {
                 // Галерея просто пуста
                 elements.galleryContainer.innerHTML = `<p class="error" data-lang-key="gallery_empty">Галерея пуста. Попробуйте сгенерировать или загрузить изображение!</p>`;
            }
        } else {
            dataToRender.forEach(entry => {
                const item = document.createElement('div');
                item.className = "gallery-item"; item.dataset.id = entry.id;
                const img = document.createElement('img');
                img.src = entry.data; img.loading = "lazy"; img.alt = entry.prompt;
                img.addEventListener('click', () => handlers.viewImage(entry.data));
                const controls = document.createElement('div');
                controls.className = 'item-controls';
                const fav = document.createElement('div');
                fav.innerText = entry.favorite ? '⭐' : '☆'; fav.className = 'favorite-star';
                fav.addEventListener('click', (e) => { e.stopPropagation(); handlers.toggleFavorite(entry.id, !entry.favorite); });
                const cb = document.createElement('input');
                cb.type = 'checkbox'; cb.className = 'select-checkbox';
                cb.addEventListener('click', e => e.stopPropagation());
                const menuBtn = document.createElement('button');
                menuBtn.className = 'item-menu-btn'; menuBtn.innerHTML = '⋮';
                menuBtn.addEventListener('click', (e) => { e.stopPropagation(); handlers.showContextMenu(e.target, entry.id); });
                controls.append(fav, menuBtn, cb);
                item.append(img, controls);
                elements.galleryContainer.appendChild(item);
            });
        }

    } catch (e) {
        showError(elements, `Не удалось загрузить галерею: ${e.message}`);
    }
};

export const setLanguage = (elements, lang, translations, callbacks) => {
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    const langPack = translations[lang] || translations.ru;
    document.querySelectorAll('[data-lang-key]').forEach(el => { if (langPack[el.dataset.langKey]) el.textContent = langPack[el.dataset.langKey]; });
    document.querySelectorAll('[data-lang-placeholder-key]').forEach(el => { if (langPack[el.dataset.langPlaceholderKey]) el.placeholder = langPack[el.dataset.langPlaceholderKey]; });
    setupPanelIcons();
    Object.values(callbacks).forEach(cb => cb());
};


// Остальные функции без существенных изменений
export const renderStyles = (elements, translations) => { /* ... */ };
export const renderCategories = (elements, translations, handleCategoryClick) => { /* ... */ };
export const renderBackgrounds = (backgroundGridElement, setBgHandler, uploadHandler) => { /* ... */ };
export const renderChangelog = (elements) => { /* ... */ };
export const applyTheme = (id) => { /* ... */ };
export const applyCustomBackground = (imageBlob) => { /* ... */ };
export const resetBackground = () => { /* ... */ };
export const setUIGeneratorState = (elements, isLoading, message = '') => { /* ... */ };
export const displayGeneratedImage = (elements, imageUrl, prompt, isAiGenerated) => { /* ... */ };
export const showError = (elements, message) => { /* ... */ };
export const openPanel = (panel) => { if (panel) panel.style.display = 'flex'; };
export const closePanel = (panel) => { if (panel) panel.style.display = 'none'; };
export const showContextMenu = (elements, buttonElement, itemId, translations, callbacks) => { /* ... */ };
export const hideContextMenu = (elements) => { if (elements.contextMenu) elements.contextMenu.style.display = 'none'; };
export const viewImage = (elements, src) => { elements.viewerImg.src = src; openPanel(elements.imageViewer); };
