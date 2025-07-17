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

    // Закрытие просмотрщика по клику на фон (оверлей)
    if (elements.imageViewer) {
        elements.imageViewer.addEventListener('click', (e) => {
            // Закрываем только если клик был на самом оверлее, а не на картинке внутри
            if (e.target === elements.imageViewer) {
                handlers.closePanel(elements.imageViewer);
            }
        });
    }

    // --- Главное меню ---
    if (elements.menuBtn) {
        elements.menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (elements.dropdownMenu) {
                elements.dropdownMenu.classList.toggle('hidden');
            }
        });
    }

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
                if (elements.settingsPanel) {
                    handlers.openPanel(elements.settingsPanel);
                }
            }
        });
    });

    // --- Навигация по панелям (открытие) ---
    const setupPanelButton = (btn, panel, shouldCloseDropdown = false) => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (shouldCloseDropdown && elements.dropdownMenu) {
                    elements.dropdownMenu.classList.add('hidden');
                }
                handlers.openPanel(panel);
            });
        }
    };
    setupPanelButton(elements.settingsOpenBtn, elements.settingsPanel, true);
    setupPanelButton(elements.themePanelOpenBtn, elements.themePanel);
    setupPanelButton(elements.backgroundPanelOpenBtn, elements.backgroundPanel);
    setupPanelButton(elements.sortPanelOpenBtn, elements.sortPanel);
    setupPanelButton(elements.changelogOpenBtn, elements.changelogPanel);
    setupPanelButton(elements.bugReportOpenBtn, elements.bugReportPanel);
    setupPanelButton(elements.suggestionOpenBtn, elements.suggestionPanel);

    // --- Основные действия генератора ---
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

    // --- Действия с галереей ---
    if (elements.uploadBtn) elements.uploadBtn.addEventListener('click', () => elements.uploadInput.click());
    if (elements.uploadInput) elements.uploadInput.addEventListener('change', handlers.handleUpload);
    if (elements.exportBtn) elements.exportBtn.addEventListener('click', handlers.exportSelected);
    if (elements.deleteBtn) elements.deleteBtn.addEventListener('click', handlers.deleteSelected);
    if (elements.setBgFromGalleryBtn) elements.setBgFromGalleryBtn.addEventListener('click', handlers.setBgFromGalleryBtn);
    if (elements.clearGalleryBtn) elements.clearGalleryBtn.addEventListener('click', handlers.clearGallery);
    
    // --- Действия с темами и фонами ---
    if (elements.themeResetBtn) elements.themeResetBtn.addEventListener('click', () => handlers.applyTheme('dark'));
    if (elements.backgroundResetBtn) elements.backgroundResetBtn.addEventListener('click', handlers.resetBackground);
    
    // --- ДИАГНОСТИКА: Шаг 2 ---
    // Проверим элемент backgroundGrid прямо перед тем, как его использовать
    if (elements.backgroundGrid) {
        elements.backgroundGrid.addEventListener('click', (e) => {
            const bgCard = e.target.closest('[data-bg-id]');
            if (bgCard) {
                if (bgCard.dataset.bgId === 'upload-new') {
                    if (elements.backgroundUploadInput) {
                        elements.backgroundUploadInput.click();
                    }
                } else {
                    handlers.setBackgroundFromDefault(bgCard.dataset.bgId);
                }
            }
        });
    } else {
        // Если элемент не найден, мы увидим это сообщение в консоли
        console.error("КРИТИЧЕСКАЯ ОШИБКА в events.js: elements.backgroundGrid is null!");
    }
    
    if (elements.backgroundUploadInput) elements.backgroundUploadInput.addEventListener('change', handlers.handleBackgroundUpload);

    // --- Язык ---
    if (elements.langSwitcherBtn) {
        elements.langSwitcherBtn.addEventListener('click', () => {
            const nextLang = getState().currentLanguage === 'ru' ? 'en' : 'ru';
            handlers.setLanguage(nextLang);
        });
    }
    
    // --- Отправка обратной связи ---
    if (elements.submitBugReportBtn) elements.submitBugReportBtn.addEventListener('click', () => handlers.handleFeedbackSubmit('bug'));
    if (elements.submitSuggestionBtn) elements.submitSuggestionBtn.addEventListener('click', () => handlers.handleFeedbackSubmit('suggestion'));
    
    // --- Управление выбором и сортировкой ---
    if (elements.selectAllCheckbox) elements.selectAllCheckbox.addEventListener('change', (e) => handlers.selectAllItems(e.target.checked));
    if (elements.selectAiBtn) elements.selectAiBtn.addEventListener('click', handlers.selectAiItems);
    if (elements.sortGrid) {
        elements.sortGrid.addEventListener('click', (e) => {
            const sortEl = e.target.closest('[data-sort]');
            if (sortEl) handlers.handleSort(sortEl.dataset.sort);
        });
    }

    // --- Выбор темы ---
    if (elements.themeGrid) {
        elements.themeGrid.addEventListener('click', (e) => {
            const themeEl = e.target.closest('[data-theme]');
            if (themeEl) handlers.applyTheme(themeEl.dataset.theme);
        });
    }
    
    // --- Контекстное меню ---
    if (elements.contextMenu) {
        elements.contextMenu.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (action) handlers.handleContextMenuAction(action);
        });
    }
};
