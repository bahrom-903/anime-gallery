// ===================================
//      Файл: main.js ⭐ РЕФАКТОРИНГ ⭐
// ===================================
import { TRANSLATIONS, CATEGORIES, DEFAULT_BACKGROUND_SOURCES } from './config.js';
import { getState, setState } from './state.js';
import { dbRequest } from './db.js';
import { handleServerRequest } from './api.js';
import * as ui from './ui.js';
import { setupEventListeners } from './events.js';

// === 1. Объект со всеми DOM-элементами (отформатирован для читаемости) ===
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
    selectionControls: document.getElementById('selection-controls'),
    selectAllCheckbox: document.getElementById('select-all-checkbox'),
    selectAiBtn: document.getElementById('select-ai-btn'),
    clearGalleryBtn: document.getElementById('gallery-clear-btn'),

    // Меню и Панели
    menuBtn: document.getElementById('menu-btn'),
    dropdownMenu: document.getElementById('dropdownMenu'),
    langSwitcherBtn: document.getElementById('lang-switcher-btn'),
    contextMenu: document.getElementById('context-menu'),
    
    // Настройки
    settingsPanel: document.getElementById('settingsPanel'),
    settingsOpenBtn: document.getElementById('settings-open-btn'),
    
    // Темы
    themePanel: document.getElementById('themePanel'),
    themePanelOpenBtn: document.getElementById('theme-panel-open-btn'),
    themeResetBtn: document.getElementById('theme-reset-btn'),
    themeGrid: document.getElementById('themeGrid'),
    
    // Фоны
    backgroundPanel: document.getElementById('backgroundPanel'),
    backgroundPanelOpenBtn: document.getElementById('background-panel-open-btn'),
    backgroundResetBtn: document.getElementById('background-reset-btn'),
    backgroundGrid: document.getElementById('backgroundGrid'),
    backgroundUploadBtn: document.getElementById('background-upload-btn'),
    backgroundUploadInput: document.getElementById('background-upload-input'),

    // Сортировка
    sortPanel: document.getElementById('sortPanel'),
    sortPanelOpenBtn: document.getElementById('sort-panel-open-btn'),
    sortGrid: document.getElementById('sortGrid'),

    // Просмотрщик изображений
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

// === 2. Все функции-обработчики (бизнес-логика) ⭐ РАЗБИТЫ НА МНОГОСТРОЧНЫЕ ДЛЯ ЧИТАЕМОСТИ ⭐ ===

// Объект с UI-коллбэками, которые мы передаем в другие функции
const uiCallbacksForApi = {
    setUIGeneratorState: (isLoading, msg) => ui.setUIGeneratorState(elements, isLoading, msg),
    displayGeneratedImage: (url, prompt, isAi) => {
        return ui.displayGeneratedImage(elements, url, prompt, isAi)
            .then(result => setState('lastAiResult', result));
    },
    showError: (msg) => ui.showError(elements, msg)
};

const handleAiGeneration = () => {
    const userPrompt = elements.promptInput.value.trim();
    if (!userPrompt) {
        return ui.showError(elements, 'Введите описание для генерации.');
    }
    const stylePrompt = elements.styleSelector.value;
    const finalPrompt = `${userPrompt}${stylePrompt}`;
    const negativePrompt = elements.negativePromptInput.value.trim();
    
    handleServerRequest(
        '/generate-image', 
        { prompt: finalPrompt, negative_prompt: negativePrompt, category: getState().currentCategory }, 
        uiCallbacksForApi,
        { loadingMessage: 'Отправка на сервер...', successMessage: 'AI-генерация...', promptForDisplay: userPrompt }
    );
};

const findSimilarOnline = () => {
    const category = CATEGORIES[getState().currentCategory];
    const sourceUrl = category.sources?.search || category.sources?.random;
    if (sourceUrl) {
        handleServerRequest(
            '/get-image-from-source', 
            { url: sourceUrl }, 
            uiCallbacksForApi,
            { loadingMessage: 'Поиск в сети...', successMessage: 'Загрузка...', promptForDisplay: `Поиск: ${getState().currentCategory}` }
        );
    }
};

const getRandomImage = () => {
    const category = CATEGORIES[getState().currentCategory];
    const sourceUrl = category.sources?.random;
    if (sourceUrl) {
        handleServerRequest(
            '/get-image-from-source', 
            { url: sourceUrl }, 
            uiCallbacksForApi,
            { loadingMessage: 'Ищем случайное...', successMessage: 'Загрузка...', promptForDisplay: `Случайное: ${getState().currentCategory}` }
        );
    }
};

const addEntryToGallery = async (dataUrl, prompt, isAi) => {
    const newEntry = {
        id: Date.now(),
        prompt: prompt || `image_${Date.now()}`,
        data: dataUrl,
        favorite: false,
        date: new Date().toISOString(),
        category: getState().currentCategory,
        isAiGenerated: !!isAi
    };
    try {
        await dbRequest('gallery', 'readwrite', store => store.put(newEntry));
        await handlers.renderGallery();
    } catch (e) {
        ui.showError(elements, `Ошибка сохранения в базу данных: ${e.message}`);
    }
};

const saveResultToGallery = async () => {
    const lastResult = getState().lastAiResult;
    if (!lastResult) return;
    ui.setUIGeneratorState(elements, true, 'Сохранение...');
    try {
        const response = await fetch(lastResult.imageUrl, { credentials: 'omit' });
        if (!response.ok) throw new Error("Сетевая ошибка при скачивании изображения");
        const blob = await response.blob();
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        await addEntryToGallery(dataUrl, lastResult.prompt, lastResult.isAiGenerated);
    } catch (e) {
        ui.showError(elements, "Ошибка сохранения: " + e.message);
    } finally {
        ui.setUIGeneratorState(elements, false);
    }
};

const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const langPack = TRANSLATIONS[getState().currentLanguage] || TRANSLATIONS.ru;
    const categoryName = langPack[`cat_${getState().currentCategory}`] || getState().currentCategory;
    
    if (confirm(`Вы уверены, что хотите добавить этот файл в категорию "${categoryName}"?`)) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            ui.setUIGeneratorState(elements, true, 'Загрузка...');
            try {
                await addEntryToGallery(event.target.result, file.name, false);
            } catch (err) {
                ui.showError(elements, err.message);
            } finally {
                ui.setUIGeneratorState(elements, false);
            }
        };
        reader.readAsDataURL(file);
    }
    e.target.value = ''; // Сбрасываем инпут, чтобы можно было выбрать тот же файл снова
};

const deleteSelected = async () => {
    const selectedItems = document.querySelectorAll('.gallery-item .select-checkbox:checked');
    if (selectedItems.length === 0) {
        return alert("Ничего не выбрано для удаления.");
    }
    if (confirm(`Вы уверены, что хотите удалить ${selectedItems.length} элемент(ов)?`)) {
        const idsToDelete = Array.from(selectedItems).map(cb => parseInt(cb.closest('.gallery-item').dataset.id));
        await dbRequest('gallery', 'readwrite', store => {
            for (const id of idsToDelete) {
                store.delete(id);
            }
        });
        await handlers.renderGallery();
    }
};

const exportSelected = async () => {
    const selectedItems = document.querySelectorAll('.gallery-item .select-checkbox:checked');
    if (selectedItems.length === 0) {
        return alert("Ничего не выбрано для экспорта.");
    }
    const zip = new JSZip();
    for (const cb of selectedItems) {
        const item = await dbRequest('gallery', 'readonly', store => store.get(parseInt(cb.closest('.gallery-item').dataset.id)));
        if (item && item.data) {
            const fileName = (item.prompt ? item.prompt.replace(/[\\/:*?"<>|]/g, '').substring(0, 50) : `image_${item.id}`) || `image_${item.id}`;
            zip.file(`${fileName}.png`, item.data.split(',')[1], { base64: true });
        }
    }
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = `anime_gallery_${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
};

// ... (Остальные функции `handlers` можно разбить так же для лучшей читаемости)

// === 3. Объект handlers, который мы передадим в events.js ===
const handlers = {
    handleAiGeneration,
    findSimilarOnline,
    getRandomImage,
    saveResultToGallery,
    handleUpload,
    exportSelected,
    deleteSelected,
    generateRandomPrompt: () => {
        const promptParts = { subject: ["портрет девушки", "рыцарь в доспехах", "одинокое дерево", "фэнтези город", "космический корабль", "дракон", "старый маг", "кибер-самурай"], details: ["светящиеся глаза", "в руках посох", "нежный взгляд", "капли дождя", "боевая поза", "в окружении бабочек", "с имплантами"], style: ["в стиле аниме 90-х", "в стиле киберпанк", "эпичное фэнтези", "мрачная атмосфера", "яркие цвета", "пастельные тона"], artist: ["от Artgerm", "от Greg Rutkowski", "от Makoto Shinkai", "в стиле Ghibli", "в стиле Riot Games"] };
        const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
        elements.promptInput.value = `${getRandomElement(promptParts.subject)}, ${getRandomElement(promptParts.details)}, ${getRandomElement(promptParts.style)}, ${getRandomElement(promptParts.artist)}`;
    },
    viewImage: (src) => ui.viewImage(elements, src),
    previewResult: () => {
        const lastResult = getState().lastAiResult;
        if (lastResult) ui.viewImage(elements, lastResult.imageUrl);
    },
    handleCategoryClick: (categoryId) => {
        setState('currentCategory', categoryId);
        localStorage.setItem('currentCategory', categoryId);
        ui.renderCategories(elements, TRANSLATIONS, handlers.handleCategoryClick);
        handlers.renderGallery();
    },
    toggleFavorite: async (id, isFavorite) => {
        const entry = await dbRequest('gallery', 'readwrite', store => store.get(id));
        if (entry) {
            entry.favorite = isFavorite;
            await dbRequest('gallery', 'readwrite', store => store.put(entry));
            await handlers.renderGallery();
        }
    },
    setLanguage: (lang) => {
        setState('currentLanguage', lang);
        ui.setLanguage(elements, lang, TRANSLATIONS, {
            renderCategories: () => ui.renderCategories(elements, TRANSLATIONS, handlers.handleCategoryClick),
            renderThemes: () => ui.renderThemes(elements, handlers.applyTheme),
            renderStyles: () => ui.renderStyles(elements, TRANSLATIONS),
            renderSortOptions: () => ui.renderSortOptions(elements, TRANSLATIONS, handlers.handleSort),
            renderChangelog: () => ui.renderChangelog(elements, TRANSLATIONS)
        });
    },
    applyTheme: (id) => {
        ui.applyTheme(id);
        handlers.renderThemes(); // Перерисовываем темы, чтобы показать активную
    },
    resetBackground: async () => {
        await dbRequest('settings', 'readwrite', store => store.delete('customBackground'));
        ui.resetBackground();
    },
    setBackgroundFromDefault: async (bgId) => {
        const bg = await dbRequest('defaultBackgrounds', 'readonly', store => store.get(bgId));
        if (bg) handlers.applyBackground(bg.blob);
    },
    handleBackgroundUpload: (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            handlers.applyBackground(file);
        }
        e.target.value = '';
    },
    applyBackground: async (imageBlob) => {
        await dbRequest('settings', 'readwrite', store => store.put(imageBlob, 'customBackground'));
        ui.applyCustomBackground(imageBlob);
    },
    setBackgroundFromGallery: async () => {
        const checked = document.querySelectorAll('.gallery-item .select-checkbox:checked');
        if (checked.length !== 1) return alert("Выберите ровно одно изображение.");
        const item = await dbRequest('gallery', 'readonly', store => store.get(parseInt(checked[0].closest('.gallery-item').dataset.id)));
        if (!item || !item.data) return;
        const response = await fetch(item.data);
        const blob = await response.blob();
        await handlers.applyBackground(blob);
        alert('Фон успешно установлен!');
    },
    handleFeedbackSubmit: async (type) => {
        const elementsMap = { bug: { text: elements.bugReportText, btn: elements.submitBugReportBtn, status: elements.bugReportStatus }, suggestion: { text: elements.suggestionText, btn: elements.submitSuggestionBtn, status: elements.suggestionStatus }};
        const { text, btn, status } = elementsMap[type];
        const message = text.value.trim();
        if (!message) return ui.showFeedbackStatus(status, 'Поле не может быть пустым.', 'error');
        
        btn.disabled = true;
        ui.showFeedbackStatus(status, 'Отправка...', 'success');
        
        try {
            const response = await fetch('/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, message }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Ошибка на сервере');
            ui.showFeedbackStatus(status, 'Спасибо! Сообщение успешно отправлено.', 'success');
            text.value = '';
        } catch (error) {
            ui.showFeedbackStatus(status, `Ошибка: ${error.message}`, 'error');
        } finally {
            btn.disabled = false;
            setTimeout(() => status.classList.add('hidden'), 5000);
        }
    },
    clearGallery: async () => {
        if (confirm("Вы уверены, что хотите НАВСЕГДА удалить ВСЕ изображения из галереи?")) {
            await dbRequest('gallery', 'readwrite', store => store.clear());
            await handlers.renderGallery();
        }
    },
    selectAllItems: (isChecked) => document.querySelectorAll('.gallery-item .select-checkbox').forEach(cb => cb.checked = isChecked),
    selectAiItems: async () => {
        const allItems = await dbRequest('gallery', 'readonly', store => store.getAll());
        const aiItemIds = new Set(allItems.filter(item => item.isAiGenerated).map(item => item.id));
        document.querySelectorAll('.gallery-item').forEach(itemEl => {
            const id = parseInt(itemEl.dataset.id);
            itemEl.querySelector('.select-checkbox').checked = aiItemIds.has(id);
        });
    },
    handleSort: (sortType) => {
        if (sortType === 'filter_favorite') {
            const newFilterState = !getState().isFavFilterActive;
            setState('isFavFilterActive', newFilterState);
            localStorage.setItem('isFavFilterActive', newFilterState);
        } else {
            setState('currentSort', sortType);
            localStorage.setItem('gallerySort', sortType);
        }
        handlers.renderGallery();
        ui.renderSortOptions(elements, TRANSLATIONS, handlers.handleSort);
    },
    handleContextMenuAction: async (action) => {
        const itemId = getState().contextedItemId;
        if (!action || !itemId) return;
        ui.hideContextMenu(elements);
        const item = await dbRequest('gallery', 'readwrite', store => store.get(itemId));
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
                navigator.clipboard.writeText(item.prompt)
                    .then(() => alert('Промпт скопирован!'))
                    .catch(err => console.error('Ошибка копирования:', err));
            }
        }
    },
    openPanel: ui.openPanel,
    closePanel: ui.closePanel,
    hideContextMenu: () => ui.hideContextMenu(elements),
    renderGallery: () => ui.renderGallery(elements, handlers.toggleFavorite, (target, id) => ui.showContextMenu(elements, target, id, TRANSLATIONS, { setContextedItemId: (val) => setState('contextedItemId', val) }), handlers.viewImage),
    renderThemes: () => ui.renderThemes(elements, handlers.applyTheme),
};

// === 4. Финальная инициализация ===
const setupDefaultBackgrounds = async () => {
    // Используем более надежный ключ для проверки установки
    const installKey = 'backgrounds_installed_v1';
    const installed = await dbRequest('settings', 'readonly', store => store.get(installKey));
    if (installed) return;
    
    ui.setUIGeneratorState(elements, true, 'Первичная загрузка фонов...');
    try {
        await dbRequest('defaultBackgrounds', 'readwrite', store => store.clear());
        for (const source of DEFAULT_BACKGROUND_SOURCES) {
            try {
                const response = await fetch(source.url);
                if (!response.ok) throw new Error(`HTTP error ${response.status} for ${source.name}`);
                const blob = await response.blob();
                await dbRequest('defaultBackgrounds', 'readwrite', store => store.put({ id: source.name, blob: blob }));
            } catch (e) {
                console.error(`Не удалось загрузить фон "${source.name}":`, e);
            }
        }
        await dbRequest('settings', 'readwrite', store => store.put(true, installKey));
    } catch(e) {
        console.error("Ошибка при установке стандартных фонов:", e);
        ui.showError(elements, "Не удалось загрузить стандартные фоны.");
    } finally {
        ui.setUIGeneratorState(elements, false);
    }
};

const init = async () => {
    try {
        await setupDefaultBackgrounds();
        
        // Загрузка состояния из localStorage
        setState('currentSort', localStorage.getItem('gallerySort') || 'date_desc');
        setState('isFavFilterActive', localStorage.getItem('isFavFilterActive') === 'true');
        setState('currentCategory', localStorage.getItem('currentCategory') || 'waifu');
        const savedTheme = localStorage.getItem('theme') || 'dark';
        const savedLang = localStorage.getItem('language') || 'ru';

        // Применение состояния
        handlers.applyTheme(savedTheme);
        handlers.setLanguage(savedLang);
        await ui.renderBackgrounds(elements);
        await handlers.renderGallery();
        ui.renderSortOptions(elements, TRANSLATIONS, handlers.handleSort);
        
        const savedBgBlob = await dbRequest('settings', 'readonly', store => store.get('customBackground'));
        if (savedBgBlob) {
            ui.applyCustomBackground(savedBgBlob);
        }
        
        setupEventListeners(elements, handlers);
        console.log("✅ Приложение успешно инициализировано!");
    } catch (e) {
        console.error("КРИТИЧЕСКАЯ ОШИБКА ИНИЦИАЛИЗАЦИИ:", e);
        document.body.innerHTML = `<h1 style="color:red; text-align:center; margin-top: 50px;">Критическая ошибка. Пожалуйста, очистите кэш сайта (Ctrl+F5) и перезагрузите страницу.</h1><p style="color:white; text-align:center;">${e.message}</p>`;
    }
};

init(); // Запускаем всё
