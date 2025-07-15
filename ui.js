// ===================================
//      Файл: ui.js ⭐ ВЕРСИЯ 4.0 (ФИНАЛЬНЫЕ ШТРИХИ) ⭐
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

// ⭐ ИСПРАВЛЕНА ФУНКЦИЯ СОРТИРОВКИ (внешний вид кнопок) ⭐
export const renderSortOptions = (sortControlsElement, translations, handleSort) => {
    if (!sortControlsElement) return;
    sortControlsElement.innerHTML = '';
    const langPack = translations[getState().currentLanguage] || translations.ru;
    const sortOptions = { 'date_desc': langPack.sort_newest, 'date_asc': langPack.sort_oldest, 'random': langPack.sort_random, 'filter_favorite': langPack.sort_favorites };
    
    for (const [key, value] of Object.entries(sortOptions)) {
        const button = document.createElement('button');
        // ⭐ ПРИМЕНЯЕМ ПРАВИЛЬНЫЙ КЛАСС ⭐
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
    if (!backgroundGridElement) return;
    backgroundGridElement.innerHTML = '';
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
            card.dataset.bgId = bg.id;
            card.innerHTML = `<div class="preview-box" style="background-image: url(${objectURL});"></div><div class="preview-name">${bg.id}</div>`;
            card.addEventListener('click', () => setBgHandler(bg));
            backgroundGridElement.appendChild(card);
        });
    } catch(e) { console.error("Ошибка рендера фонов:", e); }
};

// ⭐ ИСПРАВЛЕНА ЛОГИКА "ТОЛЬКО ИЗБРАННОЕ" ⭐
export const renderGallery = async (elements, toggleFavoriteHandler, showContextMenuHandler, viewImageHandler) => {
    try {
        const allGalleryData = await dbRequest('gallery', 'readonly', store => store.getAll());
        elements.galleryContainer.innerHTML = "";

        const categoryData = allGalleryData.filter(item => item.category === getState().currentCategory);
        const hasFavoritesInCategory = categoryData.some(item => item.favorite);

        let dataToRender;
        if (getState().isFavFilterActive) {
            // Если фильтр активен, но в категории нет избранного, показываем пустую галерею (но не удаляем все)
            // или показываем сообщение "В этой категории нет избранного". Пока оставим пустой.
            dataToRender = hasFavoritesInCategory ? categoryData.filter(e => e.favorite) : [];
        } else {
            dataToRender = [...categoryData];
        }
        
        const sortType = getState().currentSort;
        if (sortType === 'date_asc') dataToRender.sort((a, b) => a.id - b.id);
        else if (sortType === 'date_desc') dataToRender.sort((a, b) => b.id - a.id);
        else if (sortType === 'random') dataToRender.sort(() => Math.random() - 0.5);

        elements.selectionAndSortControls.classList.toggle('hidden', categoryData.length === 0);

        if (dataToRender.length === 0 && getState().isFavFilterActive) {
             elements.galleryContainer.innerHTML = `<p class="error" data-lang-key="no_favorites_in_category">В этой категории нет избранных изображений.</p>`;
        } else {
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
        }

    } catch (e) {
        showError(elements, `Не удалось загрузить галерею: ${e.message}`);
    }
};


export const setLanguage = (elements, lang, translations, callbacks) => {
    localStorage.setItem('language', lang); document.documentElement.lang = lang;
    const langPack = translations[lang] || translations.ru;
    document.querySelectorAll('[data-lang-key]').forEach(el => { if (langPack[el.dataset.langKey]) el.textContent = langPack[el.dataset.langKey]; });
    document.querySelectorAll('[data-lang-placeholder-key]').forEach(el => { if (langPack[el.dataset.langPlaceholderKey]) el.placeholder = langPack[el.dataset.langPlaceholderKey]; });
    callbacks.renderCategories(); callbacks.renderStyles(); callbacks.renderSortOptions(); callbacks.renderChangelog(); callbacks.renderThemes();
};

export const renderChangelog = (elements, translations) => { elements.changelogContentArea.innerHTML = `<h3>V 1.2 - Polished Diamond</h3><ul><li>Улучшена логика фильтрации "Только избранное".</li><li>Исправлен дизайн и поведение кнопок категорий и сортировки.</li><li>Исправлено отображение кнопок в главном меню.</li><li>Полностью отполирован интерфейс и исправлены мелкие визуальные недочеты.</li></ul><div class="contributor-thanks">Особая благодарность за детальные баг-репорты!</div>`; };
export const applyTheme = (id) => { document.body.className = id ? `theme-${id}` : ''; if (document.body.style.getPropertyValue('--bg-image-url')) document.body.classList.add('has-custom-bg'); localStorage.setItem("theme", id); };
export const applyCustomBackground = (imageBlob) => { const oldUrl = document.body.dataset.customBgUrl; if (oldUrl) URL.revokeObjectURL(oldUrl); const newUrl = URL.createObjectURL(imageBlob); document.body.style.setProperty('--bg-image-url', `url(${newUrl})`); document.body.classList.add('has-custom-bg'); document.body.dataset.customBgUrl = newUrl; };
export const resetBackground = () => { document.body.style.removeProperty('--bg-image-url'); document.body.classList.remove('has-custom-bg'); const oldUrl = document.body.dataset.customBgUrl; if (oldUrl) { URL.revokeObjectURL(oldUrl); delete document.body.dataset.customBgUrl; } };
export const setUIGeneratorState = (elements, isLoading, message = '') => { const btns = [elements.generateBtn, elements.findSimilarBtn, elements.randomImageBtn, elements.randomPromptBtn]; btns.forEach(btn => { if (btn) btn.disabled = isLoading; }); elements.loader.classList.toggle('hidden', !isLoading); if (isLoading) { elements.loaderText.textContent = message; elements.imageContainer.innerHTML = ''; elements.errorMessage.classList.add('hidden'); elements.resultControls.classList.add('hidden'); } };
export const displayGeneratedImage = (elements, imageUrl, prompt, isAiGenerated) => { return new Promise((resolve, reject) => { const img = new Image(); img.crossOrigin = "Anonymous"; img.src = imageUrl; img.alt = prompt; img.onload = () => { elements.imageContainer.innerHTML = ''; elements.imageContainer.appendChild(img); elements.resultControls.classList.remove('hidden'); resolve({ imageUrl, prompt, isAiGenerated }); }; img.onerror = () => { reject(new Error("Не удалось загрузить изображение.")); showError(elements, 'Ошибка загрузки изображения.'); }; }); };
export const showError = (elements, message) => { elements.errorMessage.textContent = message; elements.errorMessage.classList.remove('hidden'); };
export const showFeedbackStatus = (element, message, type) => { element.textContent = message; element.className = type; element.classList.remove('hidden'); };
export const openPanel = (panel) => { if (panel) panel.style.display = 'flex'; };
export const closePanel = (panel) => { if (panel) panel.style.display = 'none'; };
export const showContextMenu = (elements, buttonElement, itemId, translations, callbacks) => { hideContextMenu(elements); callbacks.setContextedItemId(itemId); const langPack = translations[getState().currentLanguage] || translations.ru; const rect = buttonElement.getBoundingClientRect(); const menu = elements.contextMenu; menu.innerHTML = `<button data-action="rename">${langPack.ctx_rename}</button><button data-action="copy-prompt">${langPack.ctx_copy_prompt}</button>`; menu.style.display = 'block'; const menuHeight = menu.offsetHeight; const menuWidth = menu.offsetWidth; const windowHeight = window.innerHeight; const windowWidth = window.innerWidth; let top = rect.bottom + window.scrollY + 5; let left = rect.left + window.scrollX; if (top + menuHeight > windowHeight + window.scrollY) { top = rect.top + window.scrollY - menuHeight - 5; } if (left + menuWidth > windowWidth + window.scrollX) { left = rect.right + window.scrollX - menuWidth; } menu.style.top = `${top}px`; menu.style.left = `${left}px`; };
export const hideContextMenu = (elements) => { if (elements.contextMenu) elements.contextMenu.style.display = 'none'; };
export const viewImage = (elements, src) => { elements.viewerImg.src = src; openPanel(elements.imageViewer); };
