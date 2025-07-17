import { THEMES, STYLES, CATEGORIES } from './config.js';
import { getState } from './state.js';
import { dbRequest } from './db.js';

export const renderThemes = (elements, applyTheme) => { /* ... без изменений ... */ };
export const renderStyles = (elements, translations) => { /* ... без изменений ... */ };
export const renderCategories = (elements, translations, handleCategoryClick) => { /* ... без изменений ... */ };
export const renderBackgrounds = async (elements) => { /* ... без изменений ... */ };

const renderControlButtons = (elements) => {
    if (!elements.selectionControls) return;
    
    const { currentSort, isFavFilterActive } = getState();

    elements.selectionControls.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sort === currentSort);
    });

    const filterBtn = elements.selectionControls.querySelector('.filter-btn');
    if (filterBtn) {
        filterBtn.classList.toggle('active', isFavFilterActive);
    }
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
        
        renderControlButtons(elements);

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

export const setLanguage = (elements, lang, translations, callbacks) => { /* ... без изменений ... */ };
export const applyTheme = (id) => { /* ... без изменений ... */ };
export const setUIGeneratorState = (elements, isLoading, message = '') => { /* ... без изменений ... */ };
export const displayGeneratedImage = (elements, imageUrl, prompt, isAiGenerated) => { /* ... без изменений ... */ };
export const showError = (elements, message) => { /* ... без изменений ... */ };
export const showFeedbackStatus = (element, message, type) => { /* ... без изменений ... */ };
export const openPanel = (panel) => { if (panel) panel.style.display = 'flex'; };
export const closePanel = (panel) => { if (panel) panel.style.display = 'none'; };
export const viewImage = (elements, src) => { /* ... без изменений ... */ };
export const showContextMenu = (elements, buttonElement, itemId, translations, callbacks) => { /* ... без изменений ... */ };
export const hideContextMenu = (elements) => { /* ... без изменений ... */ };
export const renderChangelog = (elements, translations) => { /* ... без изменений ... */ };
