// ===================================
//      Файл: main.js ⭐ ВЕРСИЯ 3.0 (с исправлением загрузки фона) ⭐
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

    // Управление выбором и сортировкой
    selectionAndSortControls: document.getElementById('selection-and-sort-controls'),
    selectAllBtn: document.getElementById('select-all-btn'),
    selectAiBtn: document.getElementById('select-ai-btn'),
    deselectAllBtn: document.getElementById('deselect-all-btn'),
    sortControls: document.getElementById('sort-controls'),

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

const uiCallbacksForApi = { /* ...без изменений... */ };
const handlers = { /* ...без изменений... (здесь оставляем как в прошлый раз) */ 
    handleAiGeneration: () => {
        const userPrompt = elements.promptInput.value.trim();
        if (!userPrompt) return ui.showError(elements, 'Введите описание для генерации.');
        const stylePrompt = elements.styleSelector.value;
        const finalPrompt = `${userPrompt}${stylePrompt}`;
        const negativePrompt = elements.negativePromptInput.value.trim();
        handleServerRequest('/generate-image', { prompt: finalPrompt, negative_prompt: negativePrompt, category: getState().currentCategory }, uiCallbacksForApi, { loadingMessage: 'Отправка на сервер...', successMessage: 'AI-генерация...', promptForDisplay: userPrompt });
    },
    findSimilarOnline: () => {
        const category = CATEGORIES[getState().currentCategory];
        const sourceUrl = category.sources?.search || category.sources?.random;
        if (sourceUrl) handleServerRequest('/get-image-from-source', { url: sourceUrl }, uiCallbacksForApi, { loadingMessage: 'Поиск в сети...', successMessage: 'Загрузка...', promptForDisplay: `Поиск: ${getState().currentCategory}` });
    },
    getRandomImage: () => {
        const category = CATEGORIES[getState().currentCategory];
        const sourceUrl = category.sources?.random;
        if (sourceUrl) handleServerRequest('/get-image-from-source', { url: sourceUrl }, uiCallbacksForApi, { loadingMessage: 'Ищем случайное...', successMessage: 'Загрузка...', promptForDisplay: `Случайное: ${getState().currentCategory}` });
    },
    addEntryToGallery: async (dataUrl, prompt, isAi) => {
        const newEntry = { id: Date.now(), prompt: prompt || `image_${Date.now()}`, data: dataUrl, favorite: false, date: new Date().toISOString(), category: getState().currentCategory, isAiGenerated: !!isAi };
        try { await dbRequest('gallery', 'readwrite', store => store.put(newEntry)); await handlers.renderGallery(); }
        catch (e) { ui.showError(elements, `Ошибка сохранения в базу данных: ${e.message}`); }
    },
    saveResultToGallery: async () => {
        const lastResult = getState().lastAiResult; if (!lastResult) return; ui.setUIGeneratorState(elements, true, 'Сохранение...');
        try {
            const response = await fetch(lastResult.imageUrl, { credentials: 'omit' });
            if (!response.ok) throw new Error("Сетевая ошибка");
            const blob = await response.blob();
            const dataUrl = await new Promise((resolve, reject) => { const r = new FileReader(); r.onloadend = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(blob); });
            await handlers.addEntryToGallery(dataUrl, lastResult.prompt, lastResult.isAiGenerated);
        } catch (e) { ui.showError(elements, "Ошибка сохранения: " + e.message); } finally { ui.setUIGeneratorState(elements, false); }
    },
    handleUpload: (e) => {
        const file = e.target.files[0]; if (!file) return;
        const langPack = TRANSLATIONS[getState().currentLanguage] || TRANSLATIONS.ru;
        const categoryName = langPack[`cat_${getState().currentCategory}`] || getState().currentCategory;
        if (confirm(`Вы уверены, что хотите добавить этот файл в категорию "${categoryName}"?`)) {
            const reader = new FileReader();
            reader.onload = async (event) => { ui.setUIGeneratorState(elements, true, 'Загрузка...'); try { await handlers.addEntryToGallery(event.target.result, file.name, false); } catch (err) { ui.showError(elements, err.message); } finally { ui.setUIGeneratorState(elements, false); } };
            reader.readAsDataURL(file);
        } e.target.value = '';
    },
    handleBackgroundUpload: (e) => { const file = e.target.files[0]; if (file && file.type.startsWith('image/')) handlers.applyBackground(file, 'custom'); e.target.value = ''; },
    deleteSelected: async () => {
        const selected = document.querySelectorAll('.gallery-item .select-checkbox:checked');
        if (selected.length === 0) return alert("Ничего не выбрано.");
        if (confirm(`Вы уверены, что хотите удалить ${selected.length} элемент(ов)?`)) {
            const ids = Array.from(selected).map(cb => parseInt(cb.closest('.gallery-item').dataset.id));
            await dbRequest('gallery', 'readwrite', store => { ids.forEach(id => store.delete(id)); });
            await handlers.renderGallery();
        }
    },
    exportSelected: async () => { /* ... */ },
    generateRandomPrompt: () => { /* ... */ },
    previewResult: () => { const lastResult = getState().lastAiResult; if (lastResult) ui.viewImage(elements, lastResult.imageUrl); },
    handleCategoryClick: (id) => { setState('currentCategory', id); localStorage.setItem('currentCategory', id); handlers.renderCategories(); handlers.renderGallery(); },
    toggleFavorite: async (id, isFavorite) => { const entry = await dbRequest('gallery', 'readwrite', store => store.get(id)); if (entry) { entry.favorite = isFavorite; await dbRequest('gallery', 'readwrite', store => store.put(entry)); await handlers.renderGallery(); } },
    setLanguage: (lang) => { setState('currentLanguage', lang); ui.setLanguage(elements, lang, TRANSLATIONS, { renderCategories: handlers.renderCategories, renderThemes: handlers.renderThemes, renderStyles: () => ui.renderStyles(elements, TRANSLATIONS), renderSortOptions: handlers.renderSortOptions, renderChangelog: () => ui.renderChangelog(elements, TRANSLATIONS) }); },
    applyTheme: (id) => { ui.applyTheme(id); handlers.renderThemes(); },
    resetBackground: async () => { await dbRequest('settings', 'readwrite', store => store.delete('customBackground')); ui.resetBackground(); },
    setBackgroundFromDefault: async (bg) => { if (bg) await handlers.applyBackground(bg.blob, bg.id); },
    applyBackground: async (blob, id) => { await dbRequest('settings', 'readwrite', store => store.put({ id, blob }, 'customBackground')); ui.applyCustomBackground(blob); },
    setBackgroundFromGallery: async () => { /* ... */ },
    handleFeedbackSubmit: async (type) => { /* ... */ },
    clearGallery: async () => { if (confirm("Вы уверены?")) { await dbRequest('gallery', 'readwrite', store => store.clear()); await handlers.renderGallery(); } },
    selectAllItems: (select) => document.querySelectorAll('.gallery-item .select-checkbox').forEach(cb => cb.checked = select),
    selectAiItems: async () => { const all = await dbRequest('gallery', 'readonly', store => store.getAll()); const aiIds = new Set(all.filter(i => i.isAiGenerated).map(i => i.id)); document.querySelectorAll('.gallery-item').forEach(el => { el.querySelector('.select-checkbox').checked = aiIds.has(parseInt(el.dataset.id)); }); },
    handleSort: (type) => { if (type === 'filter_favorite') { const newFilter = !getState().isFavFilterActive; setState('isFavFilterActive', newFilter); localStorage.setItem('isFavFilterActive', newFilter); } else { setState('currentSort', type); localStorage.setItem('gallerySort', type); } handlers.renderGallery(); handlers.renderSortOptions(); },
    handleContextMenuAction: async (action) => { /* ... */ },
    openPanel: ui.openPanel,
    closePanel: ui.closePanel,
    hideContextMenu: () => ui.hideContextMenu(elements),
    renderGallery: () => ui.renderGallery(elements, handlers.toggleFavorite, (t, id) => ui.showContextMenu(elements, t, id, TRANSLATIONS, { setContextedItemId: (v) => setState('contextedItemId', v) }), (src) => ui.viewImage(elements, src)),
    renderThemes: () => ui.renderThemes(elements, handlers.applyTheme),
    renderCategories: () => ui.renderCategories(elements, TRANSLATIONS, handlers.handleCategoryClick),
    renderSortOptions: () => ui.renderSortOptions(elements.sortControls, TRANSLATIONS, handlers.handleSort),
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
        
        // ⭐ ИСПРАВЛЕНА ЛОГИКА ЗАГРУЗКИ ФОНА ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ ⭐
        const savedBgData = await dbRequest('settings', 'readonly', store => store.get('customBackground'));
        if (savedBgData) {
            // Проверяем, в каком формате данные: старый (только Blob) или новый (объект {id, blob})
            const backgroundBlob = savedBgData instanceof Blob ? savedBgData : savedBgData.blob;
            if (backgroundBlob) {
                ui.applyCustomBackground(backgroundBlob);
            }
        }
        
        setupEventListeners(elements, handlers);
        console.log("✅ Приложение успешно инициализировано! v3.0");
    } catch (e) {
        console.error("КРИТИЧЕСКАЯ ОШИБКА ИНИЦИАЛИЗАЦИИ:", e);
        document.body.innerHTML = `<h1 style="color:red; text-align:center; margin-top: 50px;">Критическая ошибка. Пожалуйста, очистите кэш сайта (Ctrl+F5) и перезагрузите страницу.</h1><p style="color:white; text-align:center;">${e.message}</p>`;
    }
};

init();
