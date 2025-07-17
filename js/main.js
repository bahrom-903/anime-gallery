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
    selectAllCheckbox: document.getElementById('select-all-checkbox'),
    selectAiBtn: document.getElementById('select-ai-btn'),
    sortPanelOpenBtn: document.getElementById('sort-panel-open-btn'),
    menuBtn: document.getElementById('menu-btn'),
    dropdownMenu: document.getElementById('dropdownMenu'),
    settingsPanel: document.getElementById('settingsPanel'),
    settingsOpenBtn: document.getElementById('settings-open-btn'),
    themePanel: document.getElementById('themePanel'),
    themePanelOpenBtn: document.getElementById('theme-panel-open-btn'),
    themeResetBtn: document.getElementById('theme-reset-btn'),
    themeGrid: document.getElementById('themeGrid'),
    sortPanel: document.getElementById('sortPanel'),
    sortGrid: document.getElementById('sortGrid'),
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
    imageViewer: document.getElementById('image-viewer-overlay'),
    viewerImg: document.getElementById('viewer-img'),
    clearGalleryBtn: document.getElementById('gallery-clear-btn'),
    contextMenu: document.getElementById('context-menu'),
    langSwitcherBtn: document.getElementById('lang-switcher-btn'),
};

const addEntryToGallery = async (dataUrl, prompt, isAi) => { /* ... без изменений ... */ };
const handleCategoryClick = (categoryId) => { /* ... без изменений ... */ };
const uiCallbacks = { /* ... без изменений ... */ };
const handleAiGeneration = () => { /* ... без изменений ... */ };
const findSimilarOnline = () => { /* ... без изменений ... */ };
const getRandomImage = () => { /* ... без изменений ... */ };
const saveResultToGallery = async () => { /* ... без изменений ... */ };
const toggleFavorite = async (id, isFavorite) => { /* ... без изменений ... */ };
const deleteSelected = async () => { /* ... без изменений ... */ };
const exportSelected = async () => { /* ... без изменений ... */ };
const clearGallery = async () => { /* ... без изменений ... */ };
const handleUpload = (e) => { /* ... без изменений ... */ };
const generateRandomPrompt = () => { /* ... без изменений ... */ };
const applyBackground = async (imageBlob) => { /* ... без изменений ... */ };
const resetBackground = async () => { /* ... без изменений ... */ };
const setBackgroundFromDefault = async (bgId) => { /* ... без изменений ... */ };
const handleBackgroundUpload = (e) => { /* ... без изменений ... */ };
const setBackgroundFromGallery = async () => { /* ... без изменений ... */ };
const handleFeedbackSubmit = async (type) => { /* ... без изменений ... */ };
const setupDefaultBackgrounds = async () => { /* ... без изменений ... */ };

const selectAllItems = (select = true) => {
    document.querySelectorAll('#gallery .gallery-item .select-checkbox').forEach(cb => cb.checked = select);
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

const handleSort = (sortType) => {
    if (sortType === 'filter_favorite') {
        setState('isFavFilterActive', !getState().isFavFilterActive);
        localStorage.setItem('isFavFilterActive', getState().isFavFilterActive);
    } else {
        setState('currentSort', sortType);
        localStorage.setItem('gallerySort', sortType);
    }
    handlers.renderGallery();
    handlers.renderSortOptions();
};

const handleContextMenuAction = async (action) => { /* ... без изменений ... */ };

const handlers = {
    handleAiGeneration, findSimilarOnline, getRandomImage, generateRandomPrompt, saveResultToGallery, handleUpload, exportSelected,
    deleteSelected, clearGallery, setBgFromGalleryBtn: setBackgroundFromGallery, toggleFavorite, handleCategoryClick, applyTheme: ui.applyTheme,
    resetBackground, setBackgroundFromDefault, handleBackgroundUpload, handleFeedbackSubmit, selectAllItems, selectAiItems, handleSort,
    handleContextMenuAction,
    setLanguage: (lang) => { /* ... без изменений ... */ },
    renderGallery: () => ui.renderGallery(elements, toggleFavorite, (target, id) => ui.showContextMenu(elements, target, id, TRANSLATIONS, {setContextedItemId: (val) => setState('contextedItemId', val)}), (src) => ui.viewImage(elements, src)),
    renderSortOptions: () => ui.renderSortOptions(elements, TRANSLATIONS),
    renderCategories: () => ui.renderCategories(elements, TRANSLATIONS, handleCategoryClick),
    hideContextMenu: () => ui.hideContextMenu(elements),
    openPanel: ui.openPanel,
    closePanel: ui.closePanel,
    viewImage: (src) => ui.viewImage(elements, src)
};

const init = async () => { /* ... без изменений ... */ };
init();
