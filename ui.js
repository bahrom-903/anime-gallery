// =================================================================
//          ui.js: ФИНАЛЬНЫЙ АККОРД. ЗАМЕНИТЬ ПОЛНОСТЬЮ.
// =================================================================

import { THEMES, STYLES, CATEGORIES } from './config.js';
import { getState } from './state.js';

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

export const renderThemes = (elements) => {
    elements.themeGrid.innerHTML = '';
    THEMES.forEach(t => {
        const c = document.createElement("div");
        c.className = "preview-card";
        c.dataset.theme = t.id;
        const themeName = t.id.charAt(0).toUpperCase() + t.id.slice(1).replace(/_/g, ' ');
        c.innerHTML = `<div class="preview-box theme-${t.id}"></div><div class="preview-name">${themeName}</div>`;
        elements.themeGrid.appendChild(c);
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

export const renderSortOptions = (menuElement, translations) => {
    const langPack = translations[getState().currentLanguage] || translations.ru;
    const sortOptions = {
        'date_desc': langPack.sort_newest, 'date_asc': langPack.sort_oldest,
        'random': langPack.sort_random,
    };
    menuElement.innerHTML = '';
    for (const [key, value] of Object.entries(sortOptions)) {
        const button = document.createElement('button');
        button.dataset.sort = key;
        button.textContent = value;
        menuElement.appendChild(button);
    }
};

export const renderBackgrounds = (elements, getLangPack, getStoredBackgrounds) => {
    const langPack = getLangPack();
    elements.backgroundGrid.innerHTML = '';
    
    const uploadCard = document.createElement("div");
    uploadCard.className = "preview-card";
    uploadCard.id = "background-upload-card";
    uploadCard.innerHTML = `<div class="preview-box" style="display:flex; align-items:center; justify-content:center;font-size:3em;">+</div><div class="preview-name">${langPack.upload_your_bg}</div>`;
    elements.backgroundGrid.appendChild(uploadCard);

    getStoredBackgrounds().then(storedBgs => {
        storedBgs.forEach(bg => {
            const objectURL = URL.createObjectURL(bg.blob);
            const card = document.createElement("div");
            card.className = "preview-card";
            card.dataset.bgId = bg.id;
            card.innerHTML = `<div class="preview-box" style="background-image: url(${objectURL});" data-object-url="${objectURL}"></div><div class="preview-name">${bg.id}</div>`;
            elements.backgroundGrid.appendChild(card);
        });
    });
};
    
export const renderGallery = (elements, handlers) => {
    handlers.getGalleryData().then(dataToRender => {
        elements.galleryContainer.innerHTML = "";
        elements.selectionControls.classList.toggle('hidden', dataToRender.length === 0);
        elements.selectAllCheckbox.checked = false;
        elements.favFilterActionBtn.classList.toggle('active', getState().isFavFilterActive);

        dataToRender.forEach(entry => {
            const item = document.createElement('div');
            item.className = "gallery-item";
            item.dataset.id = entry.id;

            const img = document.createElement('img');
            img.src = entry.data;
            img.loading = "lazy";
            img.alt = entry.prompt;
            img.addEventListener('dblclick', () => handlers.viewImage(entry.data));

            const controls = document.createElement('div');
            controls.className = 'item-controls';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.className = 'select-checkbox';

            const fav = document.createElement('div');
            fav.innerText = entry.favorite ? '⭐' : '☆';
            fav.className = 'favorite-star';
            fav.addEventListener('click', (e) => { e.stopPropagation(); handlers.toggleFavorite(entry.id, !entry.favorite); });

            const menuBtn = document.createElement('button');
            menuBtn.className = 'item-menu-btn';
            menuBtn.innerHTML = '⋮';
            menuBtn.addEventListener('click', (e) => { e.stopPropagation(); handlers.showContextMenu(e.target, entry.id); });

            controls.append(cb, fav, menuBtn);
            item.append(img, controls);
            elements.galleryContainer.appendChild(item);
        });
    }).catch(e => handlers.showError(`Не удалось загрузить галерею: ${e.message}`));
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
    callbacks.renderAllDynamicContent();
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
    menu.classList.remove('hidden');
    menu.style.left = `${rect.left + window.scrollX}px`;
    menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
    menu.innerHTML = `<button data-action="rename">${langPack.ctx_rename}</button><button data-action="copy-prompt">${langPack.ctx_copy_prompt}</button>`;
};
    
export const hideContextMenu = (elements) => {
    if (elements.contextMenu) elements.contextMenu.classList.add('hidden');
};

export const showSortMenu = (elements, buttonElement, handlers) => {
    hideSortMenu(elements);
    const rect = buttonElement.getBoundingClientRect();
    const menu = elements.sortMenu;
    renderSortOptions(menu, handlers.getLangPack());
    menu.classList.remove('hidden');
    menu.style.left = `${rect.left + window.scrollX}px`;
    menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
    
    menu.querySelectorAll('button').forEach(btn => {
        btn.onclick = () => {
            handlers.handleSort(btn.dataset.sort);
            hideSortMenu(elements);
        };
    });
};

export const hideSortMenu = (elements) => {
    if(elements.sortMenu) elements.sortMenu.classList.add('hidden');
};

export const renderChangelog = (elements) => {
    elements.changelogContentArea.innerHTML = `<h3>V 1.0 - Diamond Patch</h3><ul><li>Улучшен AI-генератор с помощью системы скрытых промптов.</li><li>Исправлен дизайн и логика меню.</li><li>Добавлена возможность выбора только AI-изображений.</li><li>Множественные исправления ошибок и улучшение стабильности.</li></ul><div class="contributor-thanks">Особая благодарность всем, кто сообщал об ошибках!</div>`;
};
