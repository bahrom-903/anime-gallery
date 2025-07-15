// ===================================
//      Файл: ui.js
// ===================================
import { THEMES, STYLES, CATEGORIES } from './config.js';
import { getState } from './state.js';
import { dbRequest } from './db.js';

// Вспомогательная функция, которую мы будем использовать только внутри этого файла
const renderPreviewCards = (gridElement, items, type, nameKey, clickHandler) => {
    gridElement.innerHTML = '';
    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "preview-card";
        card.dataset[type] = item.id;
        
        const name = item[nameKey] || (item.id.charAt(0).toUpperCase() + item.id.slice(1).replace(/_/g, ' '));
        
        card.innerHTML = `<div class="preview-box theme-${item.id}"></div><div class="preview-name">${name}</div>`;
        card.addEventListener('click', () => clickHandler(item.id));
        gridElement.appendChild(card);
    });
};

// Все функции ниже будут экспортированы для использования в других модулях
export const renderThemes = (elements, applyTheme) => {
    renderPreviewCards(elements.themeGrid, THEMES, 'theme', 'name', applyTheme);
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
        btn.textContent = (langPack[`cat_${id}`] || id.replace(/_/g, ' '));
        if (id === getState().currentCategory) btn.classList.add('active-category');
        btn.addEventListener('click', () => handleCategoryClick(id));
        elements.categoryControls.appendChild(btn);
    }
};

export const renderSortOptions = (elements, translations) => {
    const langPack = translations[getState().currentLanguage] || translations.ru;
    const sortOptions = {
        'date_desc': langPack.sort_newest, 'date_asc': langPack.sort_oldest,
        'random': langPack.sort_random, 'separator': '---',
        'filter_favorite': langPack.sort_favorites
    };
    elements.sortGrid.innerHTML = '';
    for (const [key, value] of Object.entries(sortOptions)) {
        if (key === 'separator') {
            elements.sortGrid.appendChild(document.createElement('hr'));
            continue;
        }
        const button = document.createElement('button');
        button.className = 'panel-button';
        button.dataset.sort = key;
        button.textContent = value;
        if (key === 'filter_favorite' && getState().isFavFilterActive) {
            button.classList.add('active-filter');
        }
        elements.sortGrid.appendChild(button);
    }
};

export const renderBackgrounds = async (elements) => {
    try {
        const storedBgs = await dbRequest('defaultBackgrounds', 'readonly', store => store.getAll());
        elements.backgroundGrid.innerHTML = '';
        document.querySelectorAll('#backgroundGrid [data-object-url]').forEach(el => URL.revokeObjectURL(el.dataset.objectUrl));
        storedBgs.forEach(bg => {
            const objectURL = URL.createObjectURL(bg.blob);
            const card = document.createElement("div");
            card.className = "preview-card";
            card.dataset.bgId = bg.id;
            card.innerHTML = `<div class="preview-box" style="background-image: url(${objectURL});" data-object-url="${objectURL}"></div><div class="preview-name">${bg.id}</div>`;
            elements.backgroundGrid.appendChild(card);
        });
    } catch(e) {
        console.error("Ошибка рендера фонов:", e);
    }
};

export const renderGallery = async (elements, toggleFavorite, showContextMenu, viewImage) => {
    try {
        const allGalleryData = await dbRequest('gallery', 'readonly', store => store.getAll());
        elements.galleryContainer.innerHTML = "";

        let categoryData = allGalleryData.filter(item => item.category === getState().currentCategory);
        let dataToRender = getState().isFavFilterActive ? categoryData.filter(e => e.favorite) : [...categoryData];
        
        // Сортировка
        const sortType = getState().currentSort;
        if (sortType === 'date_asc') dataToRender.sort((a, b) => a.id - b.id);
        else if (sortType === 'date_desc') dataToRender.sort((a, b) => b.id - a.id);
        else if (sortType === 'random') dataToRender.sort(() => Math.random() - 0.5);

        // Показ/скрытие панели выбора
        elements.selectionControls.classList.toggle('hidden', dataToRender.length === 0);
        elements.selectAllCheckbox.checked = false;

        // Рендер элементов
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
    elements.loader.classList.toggle('hidden', !isLoading);
    if (isLoading) {
        elements.loaderText.textContent = message;
        elements.imageContainer.innerHTML = '';
        elements.errorMessage.classList.add('hidden');
        elements.resultControls.classList.add('hidden');
    }
};

export const displayGeneratedImage = (elements, imageUrl, prompt, isAiGenerated) => {
    return new Promise((resolve, reject) => {
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
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.remove('hidden');
};

export const openPanel = (panel) => { if (panel) panel.style.display = 'flex'; };
export const closePanel = (panel) => { if (panel) panel.style.display = 'none'; };

export const showContextMenu = (elements, buttonElement, itemId, translations, callbacks) => {
    hideContextMenu(elements);
    callbacks.setContextedItemId(itemId);
    const langPack = translations[getState().currentLanguage] || translations.ru;
    const rect = buttonElement.getBoundingClientRect();
    const menu = elements.contextMenu;
    menu.style.display = 'block';
    menu.style.left = `${rect.left + window.scrollX}px`;
    menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
    menu.innerHTML = `<button data-action="rename">${langPack.ctx_rename}</button><button data-action="copy-prompt">${langPack.ctx_copy_prompt}</button>`;
};

export const hideContextMenu = (elements) => {
    if (elements.contextMenu) elements.contextMenu.style.display = 'none';
};

export const renderChangelog = (elements, translations) => {
    // Здесь можно будет добавить логику для разных языков, если понадобится
    elements.changelogContentArea.innerHTML = `<h3>V 1.0 - Diamond Patch</h3><ul><li>Улучшен AI-генератор с помощью системы скрытых промптов.</li><li>Исправлен дизайн и логика меню.</li><li>Добавлена возможность выбора только AI-изображений.</li><li>Множественные исправления ошибок и улучшение стабильности.</li></ul><div class="contributor-thanks">Особая благодарность всем, кто сообщал об ошибках!</div>`;
};
