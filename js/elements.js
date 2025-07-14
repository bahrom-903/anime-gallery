/**
 * js/elements.js
 * 
 * Централизованный модуль для доступа ко всем DOM-элементам приложения.
 * Каждый элемент получается по его ID и экспортируется для использования
 * в других модулях. Такой подход делает код более чистым и предсказуемым.
 */

// Функция-хелпер для поиска элемента. Выбрасывает ошибку, если элемент не найден.
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Критическая ошибка: элемент с ID "${id}" не найден в DOM.`);
    }
    return element;
}

// --- Основной контейнер и заголовок ---
export const menuBtn = getElement('menu-btn');
export const dropdownMenu = getElement('dropdownMenu');

// --- Область Авторизации ---
export const authOpenBtn = getElement('auth-open-btn');
export const userProfileArea = getElement('user-profile-area');
export const userCredits = getElement('user-credits');
export const userAvatar = getElement('user-avatar');

// --- Область Генератора ---
export const generateBtn = getElement('generate-btn');
export const findSimilarBtn = getElement('find-similar-btn');
export const randomImageBtn = getElement('random-image-btn');
export const randomPromptBtn = getElement('random-prompt-btn');
export const promptInput = getElement('prompt-input');
export const negativePromptInput = getElement('negative-prompt-input');
export const styleSelector = getElement('style-selector');
export const loader = getElement('loader');
export const loaderText = getElement('loader-text');
export const imageContainer = getElement('result-image-container');
export const resultControls = getElement('result-controls');
export const errorMessage = getElement('error-message');
export const saveBtn = getElement('save-btn');
export const previewBtn = getElement('preview-btn');

// --- Область Галереи ---
export const galleryContainer = getElement('gallery');
export const categoryControls = getElement('category-controls');
export const uploadBtn = getElement('upload-btn');
export const uploadInput = getElement('upload-input');
export const exportBtn = getElement('export-selected-btn');
export const deleteBtn = getElement('delete-selected-btn');
export const setBgFromGalleryBtn = getElement('set-bg-from-gallery-btn');

// --- Управление выбором в галерее ---
export const selectionControls = getElement('selection-controls');
export const selectAllCheckbox = getElement('select-all-checkbox');
export const selectAiCheckbox = getElement('select-ai-checkbox');

// --- Панели (Overlays) ---
export const authPanel = getElement('authPanel');
export const authFormContainer = getElement('auth-form-container');
export const authStatus = getElement('auth-status');

export const settingsPanel = getElement('settingsPanel');
export const settingsOpenBtn = getElement('settings-open-btn');

export const themePanel = getElement('themePanel');
export const themePanelOpenBtn = getElement('theme-panel-open-btn');
export const themeResetBtn = getElement('theme-reset-btn');
export const themeGrid = getElement('themeGrid');

export const backgroundPanel = getElement('backgroundPanel');
export const backgroundPanelOpenBtn = getElement('background-panel-open-btn');
export const backgroundResetBtn = getElement('background-reset-btn');
export const backgroundGrid = getElement('backgroundGrid');
export const backgroundUploadBtn = getElement('background-upload-btn');
export const backgroundUploadInput = getElement('background-upload-input');

export const sortPanel = getElement('sortPanel');
export const sortPanelOpenBtn = getElement('sort-panel-open-btn');
export const sortGrid = getElement('sortGrid');

export const feedbackPanel = getElement('feedbackPanel');
export const changelogOpenBtn = getElement('changelog-open-btn');
export const bugReportOpenBtn = getElement('bug-report-open-btn');
export const suggestionOpenBtn = getElement('suggestion-open-btn');
export const feedbackTitle = getElement('feedback-title');
export const feedbackDescription = getElement('feedback-description');
export const feedbackText = getElement('feedback-text');
export const submitFeedbackBtn = getElement('submit-feedback-btn');
export const feedbackStatus = getElement('feedback-status');

// --- Просмотрщик изображений ---
export const imageViewer = getElement('image-viewer');
export const viewerImg = getElement('viewer-img');

// --- Контекстное меню ---
export const contextMenu = getElement('context-menu');

// --- Другие элементы управления ---
export const galleryClearBtn = getElement('gallery-clear-btn');
export const langSwitcherBtn = getElement('lang-switcher-btn');
