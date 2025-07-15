// ===================================
//      Файл: ui.js ⭐ ИСПРАВЛЕННАЯ ВЕРСИЯ 2.0 ⭐
// ===================================
import { THEMES, STYLES, CATEGORIES } from './config.js';
import { getState } from './state.js';
import { dbRequest } from './db.js';

// === Функции рендера (перерисовки интерфейса) ===

export const renderThemes = (elements, applyThemeHandler) => {
    elements.themeGrid.innerHTML = '';
    THEMES.forEach(item => {
        const card = document.createElement("div");
        card.className = "preview-card";
        card.dataset.theme = item.id;
        const name = item.id.charAt(0).toUpperCase() + item.id.slice(1).replace(/_/g, ' ');
        card.innerHTML = `<div class="preview-box theme-${item.id}"></div><div class="preview-name">${name}</div>`;
        card.addEventListener('click', () => applyThemeHandler(item.id));
        elements.themeGrid.appendChild(card);
    });
};

export const renderStyles = (elements, translations) => {
    elements.styleSelector.innerHTML = '';
    const langPack = translations[getState().currentLanguage] || translations.ru;
    for (const [id, value] of Object.entries(STYLES)) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = (langPack[`style_${id}`] || id);
        elements.styleSelector.appendChild(option);
    }
};

export const renderCategories = (elements, translations, handleCategoryClick) => {
    elements.categoryControls.innerHTML = '';
    const langPack = translations[getState().currentLanguage] || translations.ru;
    for (const id of Object.keys(CATEGORIES)) {
        const btn = document.createElement('button');
        btn.dataset.categoryId = id;
        btn.textContent = langPack[`cat_${id}`] || id.replace(/_/g, ' ');
        if (id === getState().currentCategory) btn.classList.add('active-category');
        btn.addEventListener('click', () => handleCategoryClick(id));
        elements.categoryControls.appendChild(btn);
    }
};

// ⭐ ИСПРАВЛЕНА ФУНКЦИЯ СОРТИРОВКИ ⭐
export const renderSortOptions = (sortControlsElement, translations, handleSort) => {
    if (!sortControlsElement) return; // Защита от ошибок
    sortControlsElement.innerHTML = '';
    const langPack = translations[getState().currentLanguage] || translations.ru;
    const sortOptions = { 'date_desc': langPack.sort_newest, 'date_asc': langPack.sort_oldest, 'random': langPack.sort_random, 'filter_favorite': langPack.sort_favorites };
    for (const [key, value] of Object.entries(sortOptions)) {
        const button = document.createElement('button');
        button.className = 'text-like-button';
        button.dataset.sort = key;
        button.textContent = value;
        
        const currentSort = getState().currentSort;
        const isFavFilterActive = getState().isFavFilterActive;

        if ((key !== 'filter_favorite' && key === currentSort) || (key === 'filter_favorite' && isFavFilterActive)) {
            button.classList.add('active-sort');
        }

        button.addEventListener('click', () => handleSort(key));
        sortControlsElement.appendChild(button);
    }
};

export const renderBackgrounds = async (backgroundGridElement, setBgHandler, uploadHandler) => {
    backgroundGridElement.innerHTML = '';
    // Создаем кнопку загрузки как превью
    const uploadCard = document.createElement("div");
    uploadCard.className = "preview-card";
    uploadCard.innerHTML = `<div class="preview-box upload-box">📥</div><div class="preview-name" data-lang-key="upload_your_bg">Загрузить свой фон</div>`;
    uploadCard.addEventListener('click', uploadHandler);
    backgroundGridElement.appendChild(uploadCard);

    try {
        const storedBgs = await dbRequest('defaultBackgrounds', 'readonly', store => store.getAll());
        storedBgs.forEach(bg => {
            const objectURL = URL.createObjectURL(bg.blob);
            const card = document.createElement("div");
            card.className = "preview-card";
            card.innerHTML = `<div class="preview-box" style="background-image: url(${objectURL});"></div><div class="preview-name">${bg.id}</div>`;
            card.addEventListener('click', () => setBgHandler(bg));
            backgroundGridElement.appendChild(card);
        });
    } catch(e) { console.error("Ошибка рендера фонов:", e); }
};

export const renderGallery = async (elements, toggleFavoriteHandler, showContextMenuHandler, viewImageHandler) => {
    try {
        const all = await dbRequest('gallery', 'readonly', store => store.getAll());
        elements.galleryContainer.innerHTML = "";
        let categoryData = all.filter(i => i.category === getState().currentCategory);
        let dataToRender = getState().isFavFilterActive ? categoryData.filter(e => e.favorite) : [...categoryData];
        const sortType = getState().currentSort;
        if (sortType === 'date_asc') dataToRender.sort((a, b) => a.id - b.id);
        else if (sortType === 'date_desc') dataToRender.sort((a, b) => b.id - a.id);
        else if (sortType === 'random') dataToRender.sort(() => Math.random() - 0.5);

        elements.selectionAndSortControls.classList.toggle('hidden', dataToRender.length === 0);

        dataToRender.forEach(entry => {
            const item = document.createElement('div');
            item.className = "gallery-item"; item.dataset.id = entry.id;
            const img = document.createElement('img');
            img.src = entry.data; img.loading = "lazy"; img.alt = entry.prompt;
            img.addEventListener('click', () => viewImageHandler(entry.data));
            const controls = document.createElement('div');
            controls.className = 'item-controls';
            const fav = document.createElement('div');
            fav.innerText = entry.favorite ? '⭐' : '☆';
            fav.className = 'favorite-star';
            fav.addEventListener('click', (e) => { e.stopPropagation(); toggleFavoriteHandler(entry.id, !entry.favorite); });
            const cb = document.createElement('input');
            cb.type = 'checkbox'; cb.className = 'select-checkbox';
            cb.addEventListener('click', e => e.stopPropagation());
            const menuBtn = document.createElement('button');
            menuBtn.className = 'item-menu-btn'; menuBtn.innerHTML = '⋮';
            menuBtn.addEventListener('click', (e) => { e.stopPropagation(); showContextMenuHandler(e.target, entry.id); });
            controls.append(fav, menuBtn, cb);
            item.append(img, controls);
            elements.galleryContainer.appendChild(item);
        });
    } catch (e) { showError(elements, `Не удалось загрузить галерею: ${e.message}`); }
};

export const renderChangelog = (elements, translations) => { /* ...без изменений... */ };

export const setLanguage = (elements, lang, translations, callbacks) => {
    localStorage.setItem('language', lang); document.documentElement.lang = lang;
    const langPack = translations[lang] || translations.ru;
    document.querySelectorAll('[data-lang-key]').forEach(el => { if (langPack[el.dataset.langKey]) el.textContent = langPack[el.dataset.langKey]; });
    document.querySelectorAll('[data-lang-placeholder-key]').forEach(el => { if (langPack[el.dataset.langPlaceholderKey]) el.placeholder = langPack[el.dataset.langPlaceholderKey]; });
    callbacks.renderCategories(); callbacks.renderStyles(); callbacks.renderSortOptions(); callbacks.renderChangelog(); callbacks.renderThemes();
};

export const applyTheme = (id) => { document.body.className = id ? `theme-${id}` : ''; if (document.body.style.getPropertyValue('--bg-image-url')) document.body.classList.add('has-custom-bg'); localStorage.setItem("theme", id); };
export const applyCustomBackground = (imageBlob) => { const oldUrl = document.body.dataset.customBgUrl; if (oldUrl) URL.revokeObjectURL(oldUrl); const newUrl = URL.createObjectURL(imageBlob); document.body.style.setProperty('--bg-image-url', `url(${newUrl})`); document.body.classList.add('has-custom-bg'); document.body.dataset.customBgUrl = newUrl; };
export const resetBackground = () => { document.body.style.removeProperty('--bg-image-url'); document.body.classList.remove('has-custom-bg'); const oldUrl = document.body.dataset.customBgUrl; if (oldUrl) { URL.revokeObjectURL(oldUrl); delete document.body.dataset.customBgUrl; } };
export const setUIGeneratorState = (elements, isLoading, message = '') => { /* ...без изменений... */ };
export const displayGeneratedImage = (elements, imageUrl, prompt, isAiGenerated) => { /* ...без изменений... */ };
export const showError = (elements, message) => { /* ...без изменений... */ };
export const showFeedbackStatus = (element, message, type) => { /* ...без изменений... */ };
export const openPanel = (panel) => { if (panel) panel.style.display = 'flex'; };
export const closePanel = (panel) => { if (panel) panel.style.display = 'none'; };
export const showContextMenu = (elements, buttonElement, itemId, translations, callbacks) => { /* ...без изменений... */ };
export const hideContextMenu = (elements) => { /* ...без изменений... */ };
export const viewImage = (elements, src) => { elements.viewerImg.src = src; openPanel(elements.imageViewer); };
