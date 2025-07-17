// ===================================
//      Файл: events.js
//      Роль: Привязка всех обработчиков событий к DOM-элементам
// ===================================
import { getState } from './state.js';

/**
 * "Оживляет" все интерактивные элементы на странице.
 * @param {object} elements - Объект со всеми DOM-элементами.
 * @param {object} handlers - Объект со всеми функциями-обработчиками.
 */
export const setupEventListeners = (elements, handlers) => {
    
    // --- Глобальные клики (закрытие меню и панелей) ---
    document.body.addEventListener('click', (e) => {
        // Закрытие главного меню по клику вне его
        if (elements.menuBtn && !elements.menuBtn.contains(e.target) && elements.dropdownMenu && !elements.dropdownMenu.contains(e.target)) {
            elements.dropdownMenu.classList.add('hidden');
        }
        // Закрытие контекстного меню по клику вне его
        if (elements.contextMenu && !elements.contextMenu.contains(e.target) && !e.target.classList.contains('item-menu-btn')) {
            handlers.hideContextMenu();
        }
    });

    // ⭐ Закрытие просмотрщика по клику на фон (оверлей)
    if (elements.imageViewer) {
        elements.imageViewer.addEventListener('click', (e) => {
            // Закрываем только если клик был на самом оверлее, а не на картинке внутри
            if (e.target === elements.imageViewer) {
                handlers.closePanel(elements.imageViewer);
            }
        });
    }

    // --- Главное меню ---
    elements.menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.dropdownMenu.classList.toggle('hidden');
    });

    // --- Закрытие всех панелей ---
    document.querySelectorAll('.panel-overlay').forEach(panel => {
        panel.addEventListener('click', (e) => {
            const target = e.target;
            // Закрытие по кнопке "X"
            if (target.classList.contains('panel-close-btn') || target.closest('.panel-close-btn')) {
                handlers.closePanel(panel);
            }
            // Возврат назад по кнопке "←"
            else if (target.classList.contains('panel-back-btn') || target.closest('.panel-back-btn')) {
                handlers.closePanel(panel);
                // Возвращаемся в главную панель настроек
                handlers.openPanel(elements.settingsPanel);
            }
        });
    });

    // --- Навигация по панелям (открытие) ---
    const setupPanelButton = (btn, panel, shouldCloseDropdown = false) => {
        if (btn) btn.addEventListener('click', () => {
            if (shouldCloseDropdown) elements.dropdownMenu.classList.add('hidden');
            handlers.openPanel(panel);
        });
    };
    setupPanelButton(elements.settingsOpenBtn, elements.settingsPanel, true);
    setupPanelButton(elements.themePanelOpenBtn, elements.themePanel);
    setupPanelButton(elements.backgroundPanelOpenBtn, elements.backgroundPanel);
    setupPanelButton(elements.sortPanelOpenBtn, elements.sortPanel); // Кнопка перемещена, но логика та же
    setupPanelButton(elements.changelogOpenBtn, elements.changelogPanel);
    setupPanelButton(elements.bugReportOpenBtn, elements.bugReportPanel);
    setupPanelButton(elements.suggestionOpenBtn, elements.suggestionPanel);

    // --- Основные действия генератора ---
    elements.generateBtn.addEventListener('click', handlers.handleAiGeneration);
    elements.randomPromptBtn.addEventListener('click', handlers.generateRandomPrompt);
    elements.findSimilarBtn.addEventListener('click', handlers.findSimilarOnline);
    elements.randomImageBtn.addEventListener('click', handlers.getRandomImage);
    elements.saveBtn.addEventListener('click', handlers.saveResultToGallery);
    elements.previewBtn.addEventListener('click', () => {
        const lastResult = getState().lastAiResult;
        if (lastResult) handlers.viewImage(lastResult.imageUrl);
    });

    // --- Действия с галереей ---
    elements.uploadBtn.addEventListener('click', () => elements.uploadInput.click());
    elements.uploadInput.addEventListener('change', handlers.handleUpload);
    elements.exportBtn.addEventListener('click', handlers.exportSelected);
    elements.deleteBtn.addEventListener('click', handlers.deleteSelected);
    elements.setBgFromGalleryBtn.addEventListener('click', handlers.setBgFromGalleryBtn);
    elements.clearGalleryBtn.addEventListener('click', handlers.clearGallery);
    
    // --- Действия с темами и фонами ---
    elements.themeResetBtn.addEventListener('click', () => handlers.applyTheme('dark'));
    elements.backgroundResetBtn.addEventListener('click', handlers.resetBackground);
    elements.backgroundGrid.addEventListener('click', (e) => {
        const bgCard = e.target.closest('[data-bg-id]');
        if (bgCard) {
            if (bgCard.dataset.bgId === 'upload-new') {
                 // Эта логика теперь в ui.js, но для надежности можно оставить
                elements.backgroundUploadInput.click();
            } else {
                handlers.setBackgroundFromDefault(bgCard.dataset.bgId);
            }
        }
    });
    elements.backgroundUploadInput.addEventListener('change', handlers.handleBackgroundUpload);

    // --- Язык ---
    elements.langSwitcherBtn.addEventListener('click', () => {
        const nextLang = getState().currentLanguage === 'ru' ? 'en' : 'ru';
        handlers.setLanguage(nextLang);
    });
    
    // --- Отправка обратной связи ---
    elements.submitBugReportBtn.addEventListener('click', () => handlers.handleFeedbackSubmit('bug'));
    elements.submitSuggestionBtn.addEventListener('click', () => handlers.handleFeedbackSubmit('suggestion'));
    
    // --- Управление выбором и сортировкой ---
    elements.selectAllCheckbox.addEventListener('change', (e) => handlers.selectAllItems(e.target.checked));
    elements.selectAiBtn.addEventListener('click', handlers.selectAiItems);
    elements.sortGrid.addEventListener('click', (e) => {
        const sortEl = e.target.closest('[data-sort]');
        if (sortEl) handlers.handleSort(sortEl.dataset.sort);
    });

    // --- Выбор темы ---
    elements.themeGrid.addEventListener('click', (e) => {
        const themeEl = e.target.closest('[data-theme]');
        if (themeEl) handlers.applyTheme(themeEl.dataset.theme);
    });
    
    // --- Контекстное меню ---
    elements.contextMenu.addEventListener('click', (e) => {
        const action = e.target.closest('[data-action]')?.dataset.action;
        if (action) handlers.handleContextMenuAction(action);
    });
};

