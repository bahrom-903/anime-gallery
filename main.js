// ===================================
//      Файл: main.js ⭐ ВЕРСИЯ 5.1 (ФИНАЛ) ⭐
// ===================================
import { TRANSLATIONS, CATEGORIES, DEFAULT_BACKGROUND_SOURCES } from './config.js';
import { getState, setState } from './state.js';
import { dbRequest } from './db.js';
import { handleServerRequest } from './api.js';
import * as ui from './ui.js';
import { setupEventListeners } from './events.js';

const elements = {
    // Генератор
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

    // Галерея
    galleryContainer: document.getElementById('gallery'),
    categoryControls: document.getElementById('category-controls'),
    uploadBtn: document.getElementById('upload-btn'),
    uploadInput: document.getElementById('upload-input'),
    exportBtn: document.getElementById('export-btn'),
    deleteBtn: document.getElementById('delete-btn'),
    setBgFromGalleryBtn: document.getElementById('set-bg-from-gallery-btn'),
    clearGalleryBtn: document.getElementById('gallery-clear-btn'),
    
    // Управление
    selectionAndSortControls: document.getElementById('selection-and-sort-controls'),
    sortControls: document.getElementById('sort-controls'),
    filterControls: document.getElementById('filter-controls'),
    selectionButtons: document.getElementById('selection-controls'),

    // Меню и Панели
    menuBtn: document.getElementById('menu-btn'),
    dropdownMenu: document.getElementById('dropdownMenu'),
    langSwitcherBtn: document.getElementById('lang-switcher-btn'),
    contextMenu: document.getElementById('context-menu'),
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
    imageViewer: document.getElementById('image-viewer'),
    viewerImg: document.getElementById('viewer-img'),

    // Обратная связь
    changelogOpenBtn: document.getElementById('changelog-open-btn'),
    bugReportOpenBtn: document.getElementById('bug-report-open-btn'),
    suggestionOpenBtn: document.getElementById('suggestion-open-btn'),
    changelogPanel: document.getElementById('changelogPanel'),
    changelogContentArea: document.getElementById('changelog-content-area'),
    bugReportPanel: document.getElementById('bugReportPanel'),
    suggestionPanel: document.getElementById('suggestionPanel'),
    bugReportText: document.getElementById('bug-report-text'),
    suggestionText: document.getElementById('suggestion-text'),
    submitBugReportBtn: document.getElementById('submit-bug-report-btn'),
    submitSuggestionBtn: document.getElementById('submit-suggestion-btn'),
    bugReportStatus: document.getElementById('bug-report-status'),
    suggestionStatus: document.getElementById('suggestion-status'),
};

const uiCallbacksForApi = {
    setUIGeneratorState: (isLoading, msg) => ui.setUIGeneratorState(elements, isLoading, msg),
    displayGeneratedImage: (url, prompt, isAi) => ui.displayGeneratedImage(elements, url, prompt, isAi).then(result => setState('lastAiResult', result)),
    showError: (msg) => ui.showError(elements, msg)
};

const handlers = {
    // Генерация
    handleAiGeneration: () => { /* ...без изменений... */ },
    findSimilarOnline: () => { /* ...без изменений... */ },
    getRandomImage: () => { /* ...без изменений... */ },
    generateRandomPrompt: () => { /* ...без изменений... */ },
    // Галерея
    addEntryToGallery: async (dataUrl, prompt, isAi) => { /* ...без изменений... */ },
    saveResultToGallery: async () => { /* ...без изменений... */ },
    handleUpload: (e) => { /* ...без изменений... */ },
    deleteSelected: async () => { /* ...без изменений... */ },
    exportSelected: async () => { /* ...без изменений... */ },
    clearGallery: async () => { /* ...без изменений... */ },
    toggleFavorite: async (id, isFavorite) => { /* ...без изменений... */ },
    // UI
    handleCategoryClick: (id) => { setState('currentCategory', id); localStorage.setItem('currentCategory', id); handlers.renderCategories(); handlers.renderGallery(); },
    setLanguage: (lang) => { setState('currentLanguage', lang); ui.setLanguage(elements, lang, TRANSLATIONS, { renderCategories: handlers.renderCategories, renderThemes: handlers.renderThemes, renderStyles: () => ui.renderStyles(elements, TRANSLATIONS), renderSortOptions: handlers.renderSortOptions, renderChangelog: () => ui.renderChangelog(elements) }); },
    applyTheme: (id) => { ui.applyTheme(id); handlers.renderThemes(); },
    resetBackground: async () => { await dbRequest('settings', 'readwrite', store => store.delete('customBackground')); ui.resetBackground(); },
    setBackgroundFromDefault: async (bg) => { if (bg) await handlers.applyBackground(bg.blob, bg.id); },
    applyBackground: async (blob, id) => { await dbRequest('settings', 'readwrite', store => store.put({ id, blob }, 'customBackground')); ui.applyCustomBackground(blob); },
    setBackgroundFromGallery: async () => { /* ...без изменений... */ },
    handleBackgroundUpload: (e) => { const file = e.target.files[0]; if (file && file.type.startsWith('image/')) handlers.applyBackground(file, 'custom'); e.target.value = ''; },
    // Выбор
    selectAllItems: (select) => { document.querySelectorAll('.gallery-item .select-checkbox').forEach(cb => cb.checked = select); },
    selectAiItems: async () => { const all = await dbRequest('gallery', 'readonly', store => store.getAll()); const aiIds = new Set(all.filter(i => i.isAiGenerated).map(i => i.id)); document.querySelectorAll('.gallery-item').forEach(el => { el.querySelector('.select-checkbox').checked = aiIds.has(parseInt(el.dataset.id)); }); },
    // Сортировка
    handleSort: (type) => { if (type === 'filter_favorite') { const newFilter = !getState().isFavFilterActive; setState('isFavFilterActive', newFilter); localStorage.setItem('isFavFilterActive', newFilter); } else { setState('currentSort', type); localStorage.setItem('gallerySort', type); } handlers.renderGallery(); handlers.renderSortOptions(); },
    // Контекстное меню и панели
    handleContextMenuAction: async (action) => { /* ...без изменений... */ },
    openPanel: ui.openPanel,
    closePanel: ui.closePanel,
    hideContextMenu: () => ui.hideContextMenu(elements),
    previewResult: () => { const lastResult = getState().lastAiResult; if (lastResult) ui.viewImage(elements, lastResult.imageUrl); },
    // Обратная связь
    handleFeedbackSubmit: async (type) => { /* ...без изменений... */ },

    // Функции рендера, вызываемые из других мест
    renderGallery: () => ui.renderGallery(elements, { toggleFavorite: handlers.toggleFavorite, showContextMenu: handlers.showContextMenu, viewImage: (src) => ui.viewImage(elements, src) }),
    renderThemes: () => ui.renderThemes(elements, handlers.applyTheme),
    renderCategories: () => ui.renderCategories(elements, TRANSLATIONS, handlers.handleCategoryClick),
    // ⭐ ИСПРАВЛЕНО: Теперь handler вызывает ui.renderSortOptions, как и ожидается
    renderSortOptions: () => ui.renderSortOptions(elements, TRANSLATIONS, handlers),
};

const setupDefaultBackgrounds = async () => { /* ...без изменений... */ };

const init = async () => {
    try {
        await setupDefaultBackgrounds();
        setState('currentSort', localStorage.getItem('gallerySort') || 'date_desc');
        setState('isFavFilterActive', localStorage.getItem('isFavFilterActive') === 'true');
        setState('currentCategory', localStorage.getItem('currentCategory') || 'waifu');
        const savedTheme = localStorage.getItem('theme') || 'dark';
        const savedLang = localStorage.getItem('language') || 'ru';
        
        handlers.applyTheme(savedTheme);
        handlers.setLanguage(savedLang);
        
        await ui.renderBackgrounds(elements.backgroundGrid, handlers.setBackgroundFromDefault, () => elements.backgroundUploadInput.click());
        await handlers.renderGallery();
        handlers.renderSortOptions();
        
        const savedBgData = await dbRequest('settings', 'readonly', store => store.get('customBackground'));
        if (savedBgData) {
            const backgroundBlob = savedBgData instanceof Blob ? savedBgData : savedBgData.blob;
            if (backgroundBlob) { ui.applyCustomBackground(backgroundBlob); }
        }
        
        setupEventListeners(elements, handlers);
        console.log("✅ Приложение успешно инициализировано! v5.1");
    } catch (e) {
        console.error("КРИТИЧЕСКАЯ ОШИБКА ИНИЦИАЛИЗАЦИИ:", e);
        document.body.innerHTML = `<h1 style="color:red; text-align:center; margin-top: 50px;">Критическая ошибка. Пожалуйста, очистите кэш сайта (Ctrl+F5) и перезагрузите страницу.</h1><p style="color:white; text-align:center;">${e.message}</p>`;
    }
};

init();
