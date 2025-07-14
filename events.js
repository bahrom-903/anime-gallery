// ===================================
//      Файл: events.js
// ===================================
import { getState } from './state.js';
import { TRANSLATIONS } from './config.js';

/**
 * "Оживляет" все кнопки и элементы на странице, привязывая к ним функции-обработчики.
 * @param {object} elements - Объект со всеми DOM-элементами.
 * @param {object} handlers - Объект со всеми функциями-обработчиками (например, { handleAiGeneration, applyTheme }).
 */
export const setupEventListeners = (elements, handlers) => {
    // Глобальные клики для закрытия меню
    document.body.addEventListener('click', (e) => {
        if (elements.menuBtn && !elements.menuBtn.contains(e.target) && elements.dropdownMenu && !elements.dropdownMenu.contains(e.target)) {
            elements.dropdownMenu.classList.add('hidden');
        }
        if (elements.contextMenu && !elements.contextMenu.contains(e.target) && !e.target.classList.contains('item-menu-btn')) {
            handlers.hideContextMenu();
        }
    });

    // Открытие/закрытие главного меню
    elements.menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.dropdownMenu.classList.toggle('hidden');
    });

    // Закрытие панелей
    document.querySelectorAll('.panel-overlay').forEach(panel => {
        panel.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (target?.classList.contains('panel-close-btn') || e.target === panel) {
                handlers.closePanel(panel);
            } else if (target?.classList.contains('panel-back-btn')) {
                handlers.closePanel(panel);
                handlers.openPanel(elements.settingsPanel);
            }
        });
    });

    // Навигация по панелям
    const setupPanelButton = (btn, panel, shouldCloseDropdown = false) => {
        if(btn) btn.addEventListener('click', () => {
            if(shouldCloseDropdown) elements.dropdownMenu.classList.add('hidden');
            handlers.openPanel(panel);
        });
    };
    setupPanelButton(elements.settingsOpenBtn, elements.settingsPanel, true);
    setupPanelButton(elements.themePanelOpenBtn, elements.themePanel);
    setupPanelButton(elements.backgroundPanelOpenBtn, elements.backgroundPanel);
    setupPanelButton(elements.sortPanelOpenBtn, elements.sortPanel);
    setupPanelButton(elements.changelogOpenBtn, elements.changelogPanel);
    setupPanelButton(elements.bugReportOpenBtn, elements.bugReportPanel);
    setupPanelButton(elements.suggestionOpenBtn, elements.suggestionPanel);

    // Основные действия генератора
    elements.generateBtn.addEventListener('click', handlers.handleAiGeneration);
    elements.randomPromptBtn.addEventListener('click', handlers.generateRandomPrompt);
    elements.findSimilarBtn.addEventListener('click', handlers.findSimilarOnline);
    elements.randomImageBtn.addEventListener('click', handlers.getRandomImage);
    elements.saveBtn.addEventListener('click', handlers.saveResultToGallery);
    elements.previewBtn.addEventListener('click', () => {
        const lastResult = getState().lastAiResult;
        if (lastResult) handlers.viewImage(lastResult.imageUrl);
    });

    // Действия с галереей
    elements.uploadBtn.addEventListener('click', () => elements.uploadInput.click());
    elements.uploadInput.addEventListener('change', handlers.handleUpload);
    elements.exportBtn.addEventListener('click', handlers.exportSelected);
    elements.deleteBtn.addEventListener('click', handlers.deleteSelected);
    elements.themeResetBtn.addEventListener('click', () => handlers.applyTheme('dark'));
    elements.backgroundResetBtn.addEventListener('click', handlers.resetBackground);
    elements.backgroundUploadBtn.addEventListener('click', () => elements.backgroundUploadInput.click());
    elements.backgroundUploadInput.addEventListener('change', handlers.handleBackgroundUpload);
    elements.clearGalleryBtn.addEventListener('click', handlers.clearGallery);
    elements.setBgFromGalleryBtn.addEventListener('click', handlers.setBackgroundFromGallery);
    elements.langSwitcherBtn.addEventListener('click', () => {
        const nextLang = getState().currentLanguage === 'ru' ? 'en' : 'ru';
        handlers.setLanguage(nextLang);
    });
    
    // Отправка обратной связи
    elements.submitBugReportBtn.addEventListener('click', () => handlers.handleFeedbackSubmit('bug'));
    elements.submitSuggestionBtn.addEventListener('click', () => handlers.handleFeedbackSubmit('suggestion'));
    
    // Управление выбором
    elements.selectAllCheckbox.addEventListener('change', (e) => handlers.selectAllItems(e.target.checked));
    elements.selectAiBtn.addEventListener('click', (e) => { e.preventDefault(); handlers.selectAiItems(); });
    
    // Сортировка
    elements.sortGrid.addEventListener('click', (e) => {
        const sortEl = e.target.closest('[data-sort]');
        if (sortEl) handlers.handleSort(sortEl.dataset.sort);
    });

    // Выбор темы
    elements.themeGrid.addEventListener('click', (e) => {
        const themeEl = e.target.closest('[data-theme]');
        if (themeEl) handlers.applyTheme(themeEl.dataset.theme);
    });

    // Выбор фона
    elements.backgroundGrid.addEventListener('click', (e) => {
        const bgCard = e.target.closest('[data-bg-id]');
        if (bgCard) handlers.setBackgroundFromDefault(bgCard.dataset.bgId);
    });
    
    // Контекстное меню
    elements.contextMenu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if(action) handlers.handleContextMenuAction(action);
    });
};
