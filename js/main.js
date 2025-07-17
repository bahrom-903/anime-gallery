
import { TRANSLATIONS, CATEGORIES, DEFAULT_BACKGROUND_SOURCES } from './config.js';
import { getState, setState } from './state.js';
import { dbRequest } from './db.js';
import { handleServerRequest } from './api.js';
import * as ui from './ui.js';
import { setupEventListeners } from './events.js';

const elements = {
    generateBtn: document.getElementById('generate-btn'),
    findSimilarBtn: document.getElementById('find-similar-btn'),
    randomImageBtn: document.getElementById('random-image-btn'),
    promptInput: document.getElementById('prompt-input'),
    negativePromptInput: document.getElementById('negative-prompt-input'),
    styleSelector: document.getElementById('style-selector'),
    randomPromptBtn: document.getElementById('random-prompt-btn'),
    loader: document.getElementById('loader'),
    loaderText: document.getElementById('loader-text'),
    imageContainer: document.getElementById('result-image-container'),
    resultControls: document.querySelector('.result-controls'),
    errorMessage: document.getElementById('error-message'),
    saveBtn: document.getElementById('save-btn'),
    previewBtn: document.getElementById('preview-btn'),
    galleryContainer: document.getElementById('gallery'),
    categoryControls: document.getElementById('category-controls'),
    uploadBtn: document.getElementById('upload-btn'),
    uploadInput: document.getElementById('upload-input'),
    exportBtn: document.getElementById('export-btn'),
    deleteBtn: document.getElementById('delete-btn'),
    setBgFromGalleryBtn: document.getElementById('set-bg-from-gallery-btn'),
    selectionControls: document.getElementById('selection-controls'),
    selectAllBtn: document.getElementById('select-all-btn'),
    selectAiBtn: document.getElementById('select-ai-btn'),
    filterFavBtn: document.getElementById('filter-fav-btn'),
    menuBtn: document.getElementById('menu-btn'),
    dropdownMenu: document.getElementById('dropdownMenu'),
    settingsPanel: document.getElementById('settingsPanel'),
    settingsOpenBtn: document.getElementById('settings-open-btn'),
    themePanel: document.getElementById('themePanel'),
    themePanelOpenBtn: document.getElementById('theme-panel-open-btn'),
    themeResetBtn: document.getElementById('theme-reset-btn'),
    themeGrid: document.getElementById('themeGrid'),
    backgroundPanel: document.getElementById('backgroundPanel'),
    backgroundPanelOpenBtn: document.getElementById('background-panel-open-btn'),
    backgroundResetBtn: document.getElementById('background-reset-btn'),
    backgroundGrid: document.getElementById('backgroundGrid'),
    backgroundUploadInput: document.getElementById('background-upload-input'),
    changelogOpenBtn: document.getElementById('changelog-open-btn'),
    changelogPanel: document.getElementById('changelogPanel'),
    changelogContentArea: document.getElementById('changelog-content-area'),
    bugReportOpenBtn: document.getElementById('bug-report-open-btn'),
    suggestionOpenBtn: document.getElementById('suggestion-open-btn'),
    bugReportPanel: document.getElementById('bugReportPanel'),
    suggestionPanel: document.getElementById('suggestionPanel'),
    bugReportText: document.getElementById('bug-report-text'),
    suggestionText: document.getElementById('suggestion-text'),
    submitBugReportBtn: document.getElementById('submit-bug-report-btn'),
    submitSuggestionBtn: document.getElementById('submit-suggestion-btn'),
    bugReportStatus: document.getElementById('bug-report-status'),
    suggestionStatus: document.getElementById('suggestion-status'),
    imageViewer: document.getElementById('image-viewer'),
    viewerImg: document.getElementById('viewer-img'),
    clearGalleryBtn: document.getElementById('gallery-clear-btn'),
    contextMenu: document.getElementById('context-menu'),
    langSwitcherBtn: document.getElementById('lang-switcher-btn'),
};

// ... (код функций addEntryToGallery, handleCategoryClick, uiCallbacks, handleAiGeneration, findSimilarOnline, getRandomImage, saveResultToGallery, toggleFavorite, deleteSelected, exportSelected, clearGallery, handleUpload, generateRandomPrompt, applyBackground, resetBackground, setBackgroundFromDefault, handleBackgroundUpload, setBackgroundFromGallery, handleFeedbackSubmit, setupDefaultBackgrounds, handleContextMenuAction остается без изменений)

// ⭐⭐ ПЕРЕПИСАНА ЛОГИКА ВЫБОРА И СОРТИРОВКИ ⭐⭐

const selectAllItems = () => {
    const checkboxes = document.querySelectorAll('#gallery .gallery-item .select-checkbox');
    // Если хотя бы один не выбран, выбираем все. Иначе — снимаем выделение со всех.
    const shouldSelectAll = ![...checkboxes].every(cb => cb.checked);
    checkboxes.forEach(cb => cb.checked = shouldSelectAll);
};

const selectAiItems = async () => {
    const allItems = document.querySelectorAll('#gallery .gallery-item');
    for (const itemEl of allItems) {
        const id = parseInt(itemEl.dataset.id);
        try {
            const itemData = await dbRequest('gallery', 'readonly', store => store.get(id));
            itemEl.querySelector('.select-checkbox').checked = !!(itemData && itemData.isAiGenerated);
        } catch(e) { console.error("Ошибка при проверке AI-метки для", id, e); }
    }
};

const handleSort = async (sortType) => {
    if (sortType === 'filter_favorite') {
        const allGalleryData = await dbRequest('gallery', 'readonly', store => store.getAll());
        const categoryData = allGalleryData.filter(item => item.category === getState().currentCategory);
        const favoriteItems = categoryData.filter(item => item.favorite);

        if (favoriteItems.length > 0 || getState().isFavFilterActive) {
            setState('isFavFilterActive', !getState().isFavFilterActive);
            localStorage.setItem('isFavFilterActive', getState().isFavFilterActive);
        }
    } else {
        setState('currentSort', sortType);
        localStorage.setItem('gallerySort', sortType);
    }
    await handlers.renderGallery();
};

// ... (остальной код main.js без изменений)

---
*Примечание: я не стал приводить здесь весь код `main.js`, а только измененный блок, так как он очень большой. Ты можешь просто заменить эти три функции (`selectAllItems`, `selectAiItems`, `handleSort`) в своем файле.*

---

#### **5. Файл `/js/events.js` (Заменить полностью)**
*Изменения: `setupEventListeners` теперь слушает клики по новой панели управления.*

```javascript
--- START OF FILE /js/events.js ---
import { getState } from './state.js';

export const setupEventListeners = (elements, handlers) => {
    
    // Глобальные клики (закрытие меню и панелей)
    document.body.addEventListener('click', (e) => {
        if (elements.menuBtn && !elements.menuBtn.contains(e.target) && elements.dropdownMenu && !elements.dropdownMenu.contains(e.target)) {
            elements.dropdownMenu.classList.add('hidden');
        }
        if (elements.contextMenu && !elements.contextMenu.contains(e.target) && !e.target.classList.contains('item-menu-btn')) {
            handlers.hideContextMenu();
        }
    });

    if (elements.imageViewer) {
        elements.imageViewer.addEventListener('click', (e) => {
            if (e.target === elements.imageViewer) {
                handlers.closePanel(elements.imageViewer);
            }
        });
    }

    // Главное меню
    if (elements.menuBtn) {
        elements.menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.dropdownMenu.classList.toggle('hidden');
        });
    }

    // Закрытие всех панелей
    document.querySelectorAll('.panel-overlay').forEach(panel => {
        panel.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('panel-close-btn') || target.closest('.panel-close-btn')) {
                handlers.closePanel(panel);
            }
            else if (target.classList.contains('panel-back-btn') || target.closest('.panel-back-btn')) {
                handlers.closePanel(panel);
                handlers.openPanel(elements.settingsPanel);
            }
        });
    });

    // Навигация по панелям (открытие)
    const setupPanelButton = (btn, panel, shouldCloseDropdown = false) => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (shouldCloseDropdown) elements.dropdownMenu.classList.add('hidden');
                handlers.openPanel(panel);
            });
        }
    };
    setupPanelButton(elements.settingsOpenBtn, elements.settingsPanel, true);
    setupPanelButton(elements.themePanelOpenBtn, elements.themePanel);
    setupPanelButton(elements.backgroundPanelOpenBtn, elements.backgroundPanel);
    setupPanelButton(elements.changelogOpenBtn, elements.changelogPanel);
    setupPanelButton(elements.bugReportOpenBtn, elements.bugReportPanel);
    setupPanelButton(elements.suggestionOpenBtn, elements.suggestionPanel);

    // Основные действия генератора
    if (elements.generateBtn) elements.generateBtn.addEventListener('click', handlers.handleAiGeneration);
    if (elements.randomPromptBtn) elements.randomPromptBtn.addEventListener('click', handlers.generateRandomPrompt);
    if (elements.findSimilarBtn) elements.findSimilarBtn.addEventListener('click', handlers.findSimilarOnline);
    if (elements.randomImageBtn) elements.randomImageBtn.addEventListener('click', handlers.getRandomImage);
    if (elements.saveBtn) elements.saveBtn.addEventListener('click', handlers.saveResultToGallery);
    if (elements.previewBtn) {
        elements.previewBtn.addEventListener('click', () => {
            const lastResult = getState().lastAiResult;
            if (lastResult) handlers.viewImage(lastResult.imageUrl);
        });
    }

    // Действия с галереей
    if (elements.uploadBtn) elements.uploadBtn.addEventListener('click', () => elements.uploadInput.click());
    if (elements.uploadInput) elements.uploadInput.addEventListener('change', handlers.handleUpload);
    if (elements.exportBtn) elements.exportBtn.addEventListener('click', handlers.exportSelected);
    if (elements.deleteBtn) elements.deleteBtn.addEventListener('click', handlers.deleteSelected);
    if (elements.setBgFromGalleryBtn) elements.setBgFromGalleryBtn.addEventListener('click', handlers.setBgFromGalleryBtn);
    if (elements.clearGalleryBtn) elements.clearGalleryBtn.addEventListener('click', handlers.clearGallery);
    
    // Действия с темами и фонами
    if (elements.themeResetBtn) elements.themeResetBtn.addEventListener('click', () => handlers.applyTheme('dark'));
    if (elements.backgroundResetBtn) elements.backgroundResetBtn.addEventListener('click', handlers.resetBackground);
    
    if (elements.backgroundGrid) {
        elements.backgroundGrid.addEventListener('click', (e) => {
            const bgCard = e.target.closest('[data-bg-id]');
            if (bgCard) {
                if (bgCard.dataset.bgId === 'upload-new') {
                    elements.backgroundUploadInput.click();
                } else {
                    handlers.setBackgroundFromDefault(bgCard.dataset.bgId);
                }
            }
        });
    }
    
    if (elements.backgroundUploadInput) elements.backgroundUploadInput.addEventListener('change', handlers.handleBackgroundUpload);

    // Язык
    if (elements.langSwitcherBtn) {
        elements.langSwitcherBtn.addEventListener('click', () => {
            const nextLang = getState().currentLanguage === 'ru' ? 'en' : 'ru';
            handlers.setLanguage(nextLang);
        });
    }
    
    // Обратная связь
    if (elements.submitBugReportBtn) elements.submitBugReportBtn.addEventListener('click', () => handlers.handleFeedbackSubmit('bug'));
    if (elements.submitSuggestionBtn) elements.submitSuggestionBtn.addEventListener('click', () => handlers.handleFeedbackSubmit('suggestion'));
    
    // ⭐⭐ НОВЫЙ ОБРАБОТЧИК ДЛЯ ПАНЕЛИ УПРАВЛЕНИЯ ⭐⭐
    if (elements.selectionControls) {
        elements.selectionControls.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            if (button.dataset.action === 'select_all') {
                handlers.selectAllItems();
            } else if (button.dataset.action === 'select_ai') {
                handlers.selectAiItems();
            } else if (button.dataset.sort) {
                handlers.handleSort(button.dataset.sort);
            }
        });
    }

    // Выбор темы
    if (elements.themeGrid) {
        elements.themeGrid.addEventListener('click', (e) => {
            const themeEl = e.target.closest('[data-theme]');
            if (themeEl) handlers.applyTheme(themeEl.dataset.theme);
        });
    }
    
    // Контекстное меню
    if (elements.contextMenu) {
        elements.contextMenu.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (action) handlers.handleContextMenuAction(action);
        });
    }
};
