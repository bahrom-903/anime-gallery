// ===================================
//      Файл: ui.js
//      Роль: Все функции, отвечающие за отрисовку и обновление интерфейса
// ===================================
import { THEMES, STYLES, CATEGORIES } from './config.js';
import { getState } from './state.js';
import { dbRequest } from './db.js';

// --- Функции рендера для панелей ---

export const renderThemes = (elements, applyTheme) => {
    const grid = elements.themeGrid;
    if (!grid) return;
    grid.innerHTML = '';
    
    THEMES.forEach(item => {
        const card = document.createElement("div");
        card.className = "preview-card";
        card.dataset.theme = item.id;
        
        const name = item.id.charAt(0).toUpperCase() + item.id.slice(1).replace(/_/g, ' ');
        
        card.innerHTML = `<div class="preview-box theme-${item.id}"></div><div class="preview-name">${name}</div>`;
        card.addEventListener('click', () => applyTheme(item.id));
        grid.appendChild(card);
    });
};

export const renderStyles = (elements, translations) => {
    const selector = elements.styleSelector;
    if (!selector) return;
    selector.innerHTML = '';

    const langPack = translations[getState().currentLanguage] || translations.ru;
    for (const [id, value] of Object.entries(STYLES)) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = (langPack[`style_${id}`] || id);
        selector.appendChild(option);
    }
};

export const renderCategories = (elements, translations, handleCategoryClick) => {
    const controls = elements.categoryControls;
    if (!controls) return;
    controls.innerHTML = '';

    const langPack = translations[getState().currentLanguage] || translations.ru;
    for (const id of Object.keys(CATEGORIES)) {
        const btn = document.createElement('button');
        btn.dataset.categoryId = id;
        btn.textContent = (langPack[`cat_${id}`] || id.replace(/_/g, ' '));
        if (id === getState().currentCategory) btn.classList.add('active-category');
        btn.addEventListener('click', () => handleCategoryClick(id));
        controls.appendChild(btn);
    }
};

export const renderBackgrounds = async (elements) => {
    try {
        const grid = elements.backgroundGrid;
        if (!grid) {
            console.error("Элемент backgroundGrid не найден!");
            return;
        }
        
        const storedBgs = await dbRequest('defaultBackgrounds', 'readonly', store => store.getAll());
        grid.innerHTML = '';

        const uploadCard = document.createElement("div");
        uploadCard.className = "preview-card";
        uploadCard.dataset.bgId = "upload-new";
        uploadCard.innerHTML = `<div class="preview-box upload-box">📥</div><div class="preview-name" data-lang-key="upload_your_bg">Загрузить свой фон</div>`;
        grid.appendChild(uploadCard);

        const existingObjectURLs = document.querySelectorAll('#backgroundPanel [data-object-url]');
        existingObjectURLs.forEach(el => URL.revokeObjectURL(el.dataset.objectUrl));
        
        storedBgs.forEach(bg => {
            const objectURL = URL.createObjectURL(bg.blob);
            const card = document.createElement("div");
            card.className = "preview-card";
            card.dataset.bgId = bg.id;
            card.innerHTML = `<div class="preview-box" style="background-image: url(${objectURL});" data-object-url="${objectURL}"></div><div class="preview-name">${bg.id}</div>`;
            grid.appendChild(card);
        });
    } catch(e) {
        console.error("Ошибка рендера фонов:", e);
    }
};

// ⭐⭐ НОВАЯ ФУНКЦИЯ ДЛЯ ОБНОВЛЕНИЯ КНОПОК УПРАВЛЕНИЯ ⭐⭐
const renderControlButtons = (elements) => {
    if (!elements.selectionControls) return;
    
    const { currentSort, isFavFilterActive } = getState();

    elements.selectionControls.querySelectorAll('.sort-btn').forEach(btn => {
        const isSortButton = !btn.dataset.sort.includes('filter');
        const isFilterButton = btn.dataset.sort === 'filter_favorite';

        if (isSortButton) {
            btn.classList.toggle('active', btn.dataset.sort === currentSort);
        }
        if (isFilterButton) {
            btn.classList.toggle('active', isFavFilterActive);
        }
    });
};

export const renderGallery = async (elements, toggleFavorite, showContextMenu, viewImage) => {
    try {
        const allGalleryData = await dbRequest('gallery', 'readonly', store => store.getAll());
        if (!elements.galleryContainer) return;
        elements.galleryContainer.innerHTML = "";

        let categoryData = allGalleryData.filter(item => item.category === getState().currentCategory);
        let dataToRender = [...categoryData];
        
        if (getState().isFavFilterActive) {
            dataToRender = categoryData.filter(e => e.favorite);
        }
        
        const sortType = getState().currentSort;
        if (sortType === 'date_asc') dataToRender.sort((a, b) => a.id - b.id);
        else if (sortType === 'date_desc') dataToRender.sort((a, b) => b.id - a.id);
        else if (sortType === 'random') dataToRender.sort(() => Math.random() - 0.5);

        if (elements.selectionControls) {
            const hasItemsInCategory = allGalleryData.some(item => item.category === getState().currentCategory);
            elements.selectionControls.classList.toggle('hidden', !hasItemsInCategory);
        }
        
        renderControlButtons(elements); // Обновляем состояние кнопок

        dataToRender.forEach(entry => {
            const item = document.createElement('div');
            item.className = "gallery-item";
            item.dataset.id = entry.id;

            const img = document.createElement('img');
            img.src = entry.data;
            img.loading = "lazy";
            img.alt = entry.prompt;
            img.addEventListener('dblclick', () => viewImage(entry.data));

            const controls = document.createElement('div');
            controls.className = 'item-controls';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.className = 'select-checkbox';

            const fav = document.createElement('div');
            fav.innerText = entry.favorite ? '⭐' : '☆';
            fav.className = 'favorite-star';
            fav.addEventListener('click', (e) => { e.stopPropagation(); toggleFavorite(entry.id, !entry.favorite); });

            const menuBtn = document.createElement('button');
            menuBtn.className = 'item-menu-btn';
            menuBtn.innerHTML = '⋮';
            menuBtn.addEventListener('click', (e) => { e.stopPropagation(); showContextMenu(e.target, entry.id); });

            controls.append(cb, fav, menuBtn);
            item.append(img, controls);
            elements.galleryContainer.appendChild(item);
        });
    } catch (e) {
        showError(elements, `Не удалось загрузить галерею: ${e.message}`);
    }
};

export const setLanguage = (elements, lang, translations, callbacks) => {
    localStorage.setItem('language', lang);
    const langPack = translations[lang] || translations.ru;
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.dataset.langKey;
        if (langPack[key]) el.textContent = langPack[key];
    });
    document.querySelectorAll('[data-lang-placeholder-key]').forEach(el => {
        const key = el.dataset.langPlaceholderKey;
        if (langPack[key]) el.placeholder = langPack[key];
    });
    // Вызываем коллбэки для перерисовки динамических элементов
    if (callbacks.renderCategories) callbacks.renderCategories();
    if (callbacks.renderThemes) callbacks.renderThemes();
    if (callbacks.renderStyles) callbacks.renderStyles();
    if (callbacks.renderChangelog) callbacks.renderChangelog();
};

export const applyTheme = (id) => {
    document.body.className = id ? `theme-${id}` : '';
    document.body.classList.toggle('has-custom-bg', !!document.body.style.getPropertyValue('--bg-image-url'));
    localStorage.setItem("theme", id);
};

export const setUIGeneratorState = (elements, isLoading, message = '') => {
    const btns = [elements.generateBtn, elements.findSimilarBtn, elements.randomImageBtn, elements.randomPromptBtn];
    btns.forEach(btn => { if (btn) btn.disabled = isLoading; });
    
    if (elements.loader) elements.loader.classList.toggle('hidden', !isLoading);
    if (elements.errorMessage) elements.errorMessage.classList.add('hidden');
    if (elements.imageContainer) elements.imageContainer.innerHTML = '';
    if (elements.resultControls) elements.resultControls.classList.add('hidden');

    if (isLoading && elements.loaderText) {
        elements.loaderText.textContent = message;
    }
};

export const displayGeneratedImage = (elements, imageUrl, prompt, isAiGenerated) => {
    return new Promise((resolve, reject) => {
        if (!elements.imageContainer || !elements.resultControls) {
            return reject(new Error("UI-элементы для отображения результата не найдены."));
        }
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;
        img.alt = prompt;
        img.onload = () => {
            elements.imageContainer.innerHTML = '';
            elements.imageContainer.appendChild(img);
            elements.resultControls.classList.remove('hidden');
            resolve({ imageUrl, prompt, isAiGenerated });
        };
        img.onerror = () => reject(new Error("Не удалось загрузить изображение."));
    });
};

export const showError = (elements, message) => {
    if (elements.errorMessage) {
        elements.errorMessage.textContent = message;
        elements.errorMessage.classList.remove('hidden');
    }
};

export const showFeedbackStatus = (element, message, type) => {
    if (element) {
        element.textContent = message;
        element.className = type; // 'success' or 'error'
        element.classList.remove('hidden');
    }
};

export const openPanel = (panel) => { if (panel) panel.style.display = 'flex'; };
export const closePanel = (panel) => { if (panel) panel.style.display = 'none'; };

export const viewImage = (elements, src) => {
    if (elements.viewerImg) elements.viewerImg.src = src;
    if (elements.imageViewer) openPanel(elements.imageViewer);
};

export const showContextMenu = (elements, buttonElement, itemId, translations, callbacks) => {
    hideContextMenu(elements);
    callbacks.setContextedItemId(itemId);
    const langPack = translations[getState().currentLanguage] || translations.ru;
    const rect = buttonElement.getBoundingClientRect();
    const menu = elements.contextMenu;

    if (menu) {
        menu.style.display = 'block';
        menu.style.left = `${rect.left + window.scrollX}px`;
        menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
        menu.innerHTML = `<button data-action="rename">${langPack.ctx_rename}</button><button data-action="copy-prompt">${langPack.ctx_copy_prompt}</button>`;
    }
};

export const hideContextMenu = (elements) => {
    if (elements.contextMenu) elements.contextMenu.style.display = 'none';
};

export const renderChangelog = (elements, translations) => {
    if (elements.changelogContentArea) {
        elements.changelogContentArea.innerHTML = `<h3>V 1.2 - Interface Update</h3><ul><li>Полностью переделан интерфейс управления галереей.</li><li>Добавлена подсветка активных режимов сортировки и фильтрации.</li><li>Исправлен баг с цветом основных панелей во всех темах.</li><li>Исправлен цвет темы "Ретро".</li><li>Исправлены баги с неработающими кнопками.</li><li>Добавлено кеширование на стороне сервера для ускорения загрузки случайных изображений.</li></ul><div class="contributor-thanks">Особая благодарность за детальные отчеты об ошибках!</div>`;
    }
};
