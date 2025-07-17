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
        
        // Добавляем класс для стилизации цветного превью
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

export const renderSortOptions = (elements, translations) => {
    const grid = elements.sortGrid;
    if (!grid) return;
    grid.innerHTML = '';

    const langPack = translations[getState().currentLanguage] || translations.ru;
    const sortOptions = {
        'date_desc': langPack.sort_newest, 'date_asc': langPack.sort_oldest,
        'random': langPack.sort_random, 'separator': '---',
        'filter_favorite': langPack.sort_favorites
    };

    for (const [key, value] of Object.entries(sortOptions)) {
        if (key === 'separator') {
            grid.appendChild(document.createElement('hr'));
            continue;
        }
        const button = document.createElement('button');
        button.className = 'panel-button';
        button.dataset.sort = key;
        button.textContent = value;
        if (key === 'filter_favorite' && getState().isFavFilterActive) {
            button.classList.add('active-filter');
        }
        grid.appendChild(button);
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

        // 1. Создаем кастомную карточку "Загрузить"
        const uploadCard = document.createElement("div");
        uploadCard.className = "preview-card";
        uploadCard.dataset.bgId = "upload-new"; // Этот data-атрибут будет отловлен в events.js
        uploadCard.innerHTML = `<div class="preview-box upload-box">📥</div><div class="preview-name" data-lang-key="upload_your_bg">Загрузить свой фон</div>`;
        grid.appendChild(uploadCard);

        // 2. Рендерим остальные фоны из базы данных
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

// --- Основные функции UI ---

export const renderGallery = async (elements, toggleFavorite, showContextMenu, viewImage) => {
    try {
        const allGalleryData = await dbRequest('gallery', 'readonly', store => store.getAll());
        if (!elements.galleryContainer) return;
        elements.galleryContainer.innerHTML = "";

        let categoryData = allGalleryData.filter(item => item.category === getState().currentCategory);
        let dataToRender = [...categoryData];
        
        if (getState().isFavFilterActive) {
            const favoriteItems = categoryData.filter(e => e.favorite);
            if (favoriteItems.length > 0 || categoryData.length === 0) {
                 dataToRender = favoriteItems;
            }
        }
        
        const sortType = getState().currentSort;
        if (sortType === 'date_asc') dataToRender.sort((a, b) => a.id - b.id);
        else if (sortType === 'date_desc') dataToRender.sort((a, b) => b.id - a.id);
        else if (sortType === 'random') dataToRender.sort(() => Math.random() - 0.5);

        if (elements.selectionControls) {
            elements.selectionControls.classList.toggle('hidden', dataToRender.length === 0);
        }
        if(elements.selectAllCheckbox) {
            elements.selectAllCheckbox.checked = false;
        }

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
    callbacks.renderCategories();
    callbacks.renderThemes();
    callbacks.renderStyles();
    callbacks.renderSortOptions();
    callbacks.renderChangelog();
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
        elements.changelogContentArea.innerHTML = `<h3>V 1.0 - Diamond Patch</h3><ul><li>Улучшен AI-генератор с помощью системы скрытых промптов.</li><li>Исправлен дизайн и логика меню.</li><li>Добавлена возможность выбора только AI-изображений.</li><li>Множественные исправления ошибок и улучшение стабильности.</li></ul><div class="contributor-thanks">Особая благодарность всем, кто сообщал об ошибках!</div>`;
    }
};
