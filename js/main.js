// =================================================================
//      ФАЙЛ: main.js
//      РОЛЬ: Главный инициализатор приложения
// =================================================================

// БЛОК 1: ИМПОРТЫ И КОНСТАНТЫ
import { TRANSLATIONS, CATEGORIES, DEFAULT_BACKGROUND_SOURCES } from './config.js';
import { getState, setState } from './state.js';
import { dbRequest } from './db.js';
import { handleServerRequest } from './api.js';
import * as ui from './ui.js';
import { setupEventListeners } from './events.js';

// БЛОК 2: ОБЪЕКТ С DOM-ЭЛЕМЕНТАМИ
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

    // Галерея и управление
    galleryContainer: document.getElementById('gallery'),
    categoryControls: document.getElementById('category-controls'),
    uploadBtn: document.getElementById('upload-btn'),
    uploadInput: document.getElementById('upload-input'),
    exportBtn: document.getElementById('export-btn'),
    deleteBtn: document.getElementById('delete-btn'),
    setBgFromGalleryBtn: document.getElementById('set-bg-from-gallery-btn'),
    selectionControls: document.getElementById('selection-controls'),

    // Меню и Панели
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
    
    // Обратная связь
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

    // Прочее
    imageViewer: document.getElementById('image-viewer-overlay'),
    viewerImg: document.getElementById('viewer-img'),
    clearGalleryBtn: document.getElementById('gallery-clear-btn'),
    contextMenu: document.getElementById('context-menu'),
    langSwitcherBtn: document.getElementById('lang-switcher-btn'),
};

// БЛОК 3: ОСНОВНАЯ ЛОГИКА (ОБРАБОТЧИКИ)
const addEntryToGallery = async (dataUrl, prompt, isAi) => {
    const newEntry = {
        id: Date.now(), prompt: prompt || `image_${Date.now()}`, data: dataUrl,
        favorite: false, date: new Date().toISOString(), category: getState().currentCategory, isAiGenerated: !!isAi
    };
    try {
        await dbRequest('gallery', 'readwrite', store => store.put(newEntry));
        await handlers.renderGallery();
    } catch (e) { ui.showError(elements, `Ошибка сохранения в базу данных: ${e.message}`); }
};

const handleCategoryClick = (categoryId) => {
    setState('currentCategory', categoryId);
    localStorage.setItem('currentCategory', categoryId);
    handlers.renderCategories();
    handlers.renderGallery();
};

const uiCallbacks = {
    setUIGeneratorState: (isLoading, msg) => ui.setUIGeneratorState(elements, isLoading, msg),
    displayGeneratedImage: (url, prompt, isAi) => ui.displayGeneratedImage(elements, url, prompt, isAi).then(result => setState('lastAiResult', result)),
    showError: (msg) => ui.showError(elements, msg),
};

const handleAiGeneration = () => {
    const userPrompt = elements.promptInput.value.trim();
    const stylePrompt = elements.styleSelector.value;
    if (!userPrompt) return ui.showError(elements, 'Введите описание.');
    const finalPrompt = `${userPrompt}${stylePrompt}`;
    const negativePrompt = elements.negativePromptInput.value.trim();
    handleServerRequest('/generate-image', { prompt: finalPrompt, negative_prompt: negativePrompt, category: getState().currentCategory }, uiCallbacks, {loadingMessage: 'Отправка на сервер...', successMessage: 'AI-генерация...', promptForDisplay: userPrompt});
};

const findSimilarOnline = () => {
    const category = CATEGORIES[getState().currentCategory];
    const source = category.sources?.search || category.sources?.random;
    if (source) handleServerRequest('/get-image-from-source', { url: source, category: getState().currentCategory }, uiCallbacks, {loadingMessage: 'Поиск в сети...', successMessage: 'Загрузка...', promptForDisplay: `Поиск: ${getState().currentCategory}`});
};

const getRandomImage = () => {
    const category = CATEGORIES[getState().currentCategory];
    const source = category.sources?.random;
    if (source) handleServerRequest('/get-image-from-source', { url: source, category: getState().currentCategory }, uiCallbacks, {loadingMessage: 'Ищем случайное...', successMessage: 'Загрузка...', promptForDisplay: `Случайное: ${getState().currentCategory}`});
};

const saveResultToGallery = async () => {
    const lastResult = getState().lastAiResult;
    if (!lastResult) return;
    ui.setUIGeneratorState(elements, true, 'Сохранение...');
    try {
        const r = await fetch(lastResult.imageUrl, {credentials: 'omit'});
        if (!r.ok) throw new Error("Сетевая ошибка при скачивании изображения");
        const blob = await r.blob();
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        await addEntryToGallery(dataUrl, lastResult.prompt, lastResult.isAiGenerated);
    } catch (e) { ui.showError(elements, "Ошибка сохранения: " + e.message); }
    finally { ui.setUIGeneratorState(elements, false); }
};

const toggleFavorite = async (id, isFavorite) => {
    try {
        const entry = await dbRequest('gallery', 'readwrite', store => store.get(id));
        if(entry) {
            entry.favorite = isFavorite;
            await dbRequest('gallery', 'readwrite', store => store.put(entry));
            await handlers.renderGallery();
        }
    } catch (e) { console.error("Ошибка при переключении избранного:", e); }
};

const deleteSelected = async () => {
    const selectedItems = document.querySelectorAll('.gallery-item .select-checkbox:checked');
    if (selectedItems.length === 0) return alert("Ничего не выбрано.");
    if (!confirm(`Вы уверены, что хотите удалить ${selectedItems.length} элемент(ов)?`)) return;
    for (const cb of selectedItems) {
        await dbRequest('gallery', 'readwrite', store => store.delete(parseInt(cb.closest('.gallery-item').dataset.id)));
    }
    await handlers.renderGallery();
};

const exportSelected = async () => {
    const selectedItems = document.querySelectorAll('.gallery-item .select-checkbox:checked');
    if (selectedItems.length === 0) return alert("Ничего не выбрано");
    const zip = new JSZip();
    for (const cb of selectedItems) {
        const item = await dbRequest('gallery', 'readonly', store => store.get(parseInt(cb.closest('.gallery-item').dataset.id)));
        if (item && item.data) {
            const fileName = (item.prompt ? item.prompt.replace(/[\\/:*?"<>|]/g, '').substring(0, 50) : `image_${item.id}`) || `image_${item.id}`;
            zip.file(`${fileName}.png`, item.data.split(',')[1], { base64: true });
        }
    }
    zip.generateAsync({ type: "blob" }).then(content => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = `anime_gallery_${Date.now()}.zip`;
        a.click();
        URL.revokeObjectURL(a.href);
    });
};

const clearGallery = async () => {
    if (confirm("Вы уверены, что хотите НАВСЕГДА удалить ВСЕ изображения из галереи?")) {
        await dbRequest('gallery', 'readwrite', store => store.clear());
        await handlers.renderGallery();
    }
};

const handleUpload = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const langPack = TRANSLATIONS[getState().currentLanguage] || TRANSLATIONS.ru;
    if(confirm(`Вы уверены, что хотите добавить этот файл в категорию "${langPack[`cat_${getState().currentCategory}`]}"?`)) {
        const r = new FileReader();
        r.onload = async (ev) => {
            ui.setUIGeneratorState(elements, true, 'Загрузка...');
            try { await addEntryToGallery(ev.target.result, f.name, false); }
            catch(err) { ui.showError(elements, err.message); }
            finally { ui.setUIGeneratorState(elements, false); }
        };
        r.readAsDataURL(f);
    }
    e.target.value = '';
};

const generateRandomPrompt = () => {
    const promptParts = { subject: ["портрет девушки", "рыцарь в доспехах", "одинокое дерево", "фэнтези город", "космический корабль", "дракон", "старый маг", "кибер-самурай"], details: ["светящиеся глаза", "в руках посох", "нежный взгляд", "капли дождя", "боевая поза", "в окружении бабочек", "с имплантами"], style: ["в стиле аниме 90-х", "в стиле киберпанк", "эпичное фэнтези", "мрачная атмосфера", "яркие цвета", "пастельные тона"], artist: ["от Artgerm", "от Greg Rutkowski", "от Makoto Shinkai", "в стиле Ghibli", "в стиле Riot Games"] };
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    elements.promptInput.value = `${getRandomElement(promptParts.subject)}, ${getRandomElement(promptParts.details)}, ${getRandomElement(promptParts.style)}, ${getRandomElement(promptParts.artist)}`;
};

const applyBackground = async (imageBlob) => {
    try {
        await dbRequest('settings', 'readwrite', store => store.put(imageBlob, 'customBackground'));
        const objectURL = URL.createObjectURL(imageBlob);
        document.body.style.setProperty('--bg-image-url', `url(${objectURL})`);
        document.body.classList.add('has-custom-bg');
    } catch(e) { ui.showError(elements, "Не удалось сохранить фон: " + e.message); }
};

const resetBackground = async () => {
    try {
        await dbRequest('settings', 'readwrite', store => store.delete('customBackground'));
        document.body.style.removeProperty('--bg-image-url');
        document.body.classList.remove('has-custom-bg');
    } catch(e) { ui.showError(elements, "Не удалось удалить фон: " + e.message); }
};

const setBackgroundFromDefault = async (bgId) => {
    try {
        const bg = await dbRequest('defaultBackgrounds', 'readonly', store => store.get(bgId));
        if (bg) await applyBackground(bg.blob);
    } catch(e) { console.error("Ошибка установки стандартного фона:", e); }
};

const handleBackgroundUpload = (e) => {
    const f = e.target.files[0];
    if (f && f.type.startsWith('image/')) { applyBackground(f); }
    e.target.value = '';
};

const setBackgroundFromGallery = async () => {
    const c = document.querySelectorAll('.gallery-item .select-checkbox:checked');
    if (c.length !== 1) return alert("Выберите ровно одно изображение.");
    try {
        const item = await dbRequest('gallery', 'readonly', store => store.get(parseInt(c[0].closest('.gallery-item').dataset.id)));
        if (!item || !item.data) return;
        const response = await fetch(item.data);
        if (!response.ok) throw new Error('Не удалось преобразовать в Blob');
        const blob = await response.blob();
        await applyBackground(blob);
        alert('Фон успешно установлен!');
    } catch(e) { ui.showError(elements, `Не удалось установить фон: ${e.message}`); }
};

const handleFeedbackSubmit = async (type) => {
    const textElement = (type === 'bug') ? elements.bugReportText : elements.suggestionText;
    const buttonElement = (type === 'bug') ? elements.submitBugReportBtn : elements.submitSuggestionBtn;
    const statusElement = (type === 'bug') ? elements.bugReportStatus : elements.suggestionStatus;
    const message = textElement.value.trim();
    if (!message) { ui.showFeedbackStatus(statusElement, 'Поле не может быть пустым.', 'error'); return; }
    buttonElement.disabled = true;
    ui.showFeedbackStatus(statusElement, 'Отправка...', 'success');
    try {
        const response = await fetch('/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, message }) });
        const result = await response.json();
        if (!response.ok) { throw new Error(result.error || 'Ошибка на сервере'); }
        ui.showFeedbackStatus(statusElement, 'Спасибо! Сообщение успешно отправлено.', 'success');
        textElement.value = '';
    } catch (error) { ui.showFeedbackStatus(statusElement, `Ошибка: ${error.message}`, 'error'); }
    finally { buttonElement.disabled = false; setTimeout(() => statusElement.classList.add('hidden'), 5000); }
};

const setupDefaultBackgrounds = async () => {
    try {
        const installed_key = 'backgrounds_installed_v1.6';
        const installed = await dbRequest('settings', 'readonly', store => store.get(installed_key));
        if (installed) return;
        ui.setUIGeneratorState(elements, true, 'Первичная загрузка фонов...');
        await dbRequest('defaultBackgrounds', 'readwrite', store => store.clear());
        for (const source of DEFAULT_BACKGROUND_SOURCES) {
            try {
                const response = await fetch(source.url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${source.name}`);
                const blob = await response.blob();
                await dbRequest('defaultBackgrounds', 'readwrite', store => store.put({ id: source.name, blob: blob }));
            } catch (e) { console.error(`Не удалось загрузить фон "${source.name}":`, e); }
        }
        await dbRequest('settings', 'readwrite', store => store.put(true, installed_key));
    } catch(e) { ui.showError(elements, "Не удалось загрузить стандартные фоны. Проверьте консоль."); }
    finally { ui.setUIGeneratorState(elements, false); }
};

const selectAllItems = () => {
    const checkboxes = document.querySelectorAll('#gallery .gallery-item .select-checkbox');
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
    setState('currentSort', sortType);
    localStorage.setItem('gallerySort', sortType);
    await handlers.renderGallery();
};

const handleFilter = async () => {
    setState('isFavFilterActive', !getState().isFavFilterActive);
    localStorage.setItem('isFavFilterActive', getState().isFavFilterActive);
    await handlers.renderGallery();
};

const handleContextMenuAction = async (action) => {
    const itemId = getState().contextedItemId;
    if (!action || !itemId) return;
    const item = await dbRequest('gallery', 'readonly', store => store.get(itemId));
    if (!item) return;
    if (action === 'rename') {
        const newPrompt = prompt("Введите новый промпт:", item.prompt);
        if (newPrompt !== null && newPrompt.trim() !== "") {
            item.prompt = newPrompt;
            await dbRequest('gallery', 'readwrite', store => store.put(item));
            await handlers.renderGallery();
        }
    } else if (action === 'copy-prompt') {
        if (item.prompt) {
            navigator.clipboard.writeText(item.prompt).then(() => alert('Промпт скопирован!')).catch(err => console.error('Ошибка копирования:', err));
        }
    }
    ui.hideContextMenu(elements);
};

// БЛОК 4: ЕДИНЫЙ ОБЪЕКТ HANDLERS
const handlers = {
    handleAiGeneration, findSimilarOnline, getRandomImage, generateRandomPrompt, saveResultToGallery, handleUpload, exportSelected,
    deleteSelected, clearGallery, setBgFromGalleryBtn: setBackgroundFromGallery, toggleFavorite, handleCategoryClick, applyTheme: ui.applyTheme,
    resetBackground, setBackgroundFromDefault, handleBackgroundUpload, handleFeedbackSubmit, selectAllItems, selectAiItems, handleSort, handleFilter,
    handleContextMenuAction,
    setLanguage: (lang) => {
        setState('currentLanguage', lang);
        ui.setLanguage(elements, lang, TRANSLATIONS, {
            renderCategories: () => ui.renderCategories(elements, TRANSLATIONS, handleCategoryClick),
            renderThemes: () => ui.renderThemes(elements, ui.applyTheme),
            renderStyles: () => ui.renderStyles(elements, TRANSLATIONS),
            renderChangelog: () => ui.renderChangelog(elements, TRANSLATIONS)
        });
    },
    renderGallery: () => ui.renderGallery(elements, toggleFavorite, (target, id) => ui.showContextMenu(elements, target, id, TRANSLATIONS, {setContextedItemId: (val) => setState('contextedItemId', val)}), (src) => ui.viewImage(elements, src)),
    renderCategories: () => ui.renderCategories(elements, TRANSLATIONS, handleCategoryClick),
    hideContextMenu: () => ui.hideContextMenu(elements),
    openPanel: ui.openPanel,
    closePanel: ui.closePanel,
    viewImage: (src) => ui.viewImage(elements, src)
};

// БЛОК 5: ФИНАЛЬНАЯ ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
const init = async () => {
    try {
        await setupDefaultBackgrounds();
        setState('currentSort', localStorage.getItem('gallerySort') || 'date_desc');
        setState('isFavFilterActive', localStorage.getItem('isFavFilterActive') === 'true');
        setState('currentCategory', localStorage.getItem('currentCategory') || 'waifu');
        const savedTheme = localStorage.getItem('theme') || 'dark';
        ui.applyTheme(savedTheme);
        const savedLang = localStorage.getItem('language') || 'ru';
        handlers.setLanguage(savedLang);
        await ui.renderBackgrounds(elements);
        await handlers.renderGallery();
        const savedBgBlob = await dbRequest('settings', 'readonly', store => store.get('customBackground'));
        if (savedBgBlob) {
            const objectURL = URL.createObjectURL(savedBgBlob);
            document.body.style.setProperty('--bg-image-url', `url(${objectURL})`);
            document.body.classList.add('has-custom-bg');
        }
        setupEventListeners(elements, handlers);
        console.log("Приложение успешно инициализировано!");
    } catch (e) {
        console.error("КРИТИЧЕСКАЯ ОШИБКА ИНИЦИАЛИЗАЦИИ:", e);
        console.error("Stack trace:", e.stack);
        document.body.innerHTML = `<div style="color:red; text-align:center; margin-top: 50px; padding: 20px;"><h1>Критическая ошибка</h1><p>Не удалось запустить приложение. Пожалуйста, попробуйте очистить кэш сайта (Ctrl+Shift+R или Ctrl+F5) и перезагрузить страницу. Если проблема повторится, свяжитесь с поддержкой.</p><p>Детали: ${e.message}</p></div>`;
    }
};

init();
