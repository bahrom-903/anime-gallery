// ===================================
//      Файл: events.js ⭐ ФИНАЛЬНАЯ ВЕРСИЯ 3.0 ⭐
// ===================================

/**
 * "Оживляет" все кнопки и элементы на странице, привязывая к ним функции-обработчики.
 * @param {object} elements - Объект со всеми DOM-элементами.
 * @param {object} handlers - Объект со всеми функциями-обработчиками.
 */
export const setupEventListeners = (elements, handlers) => {

    // Вспомогательная функция для безопасного добавления слушателей
    const addListener = (element, event, handler) => {
        if (element) {
            element.addEventListener(event, handler);
        } else {
            // Это сообщение поможет в будущем, если мы снова удалим элемент из HTML, но забудем про JS
            console.warn(`Попытка добавить слушатель на несуществующий элемент.`);
        }
    };

    // --- Глобальные клики ---
    addListener(document.body, 'click', (e) => {
        // Закрытие выпадающего меню
        if (elements.dropdownMenu && !elements.menuBtn.contains(e.target) && !elements.dropdownMenu.contains(e.target)) {
            elements.dropdownMenu.classList.add('hidden');
        }
        // Закрытие контекстного меню
        if (elements.contextMenu && !elements.contextMenu.contains(e.target) && !e.target.classList.contains('item-menu-btn')) {
            handlers.hideContextMenu();
        }
    });

    // ⭐ ИСПРАВЛЕНО: Закрытие просмотрщика по клику на фон
    addListener(elements.imageViewer, 'click', (e) => {
        // Закрываем, только если клик был на самом оверлее, а не на его дочерних элементах (картинке)
        if (e.target === elements.imageViewer) {
            handlers.closePanel(elements.imageViewer);
        }
    });

    // --- Меню и Панели ---
    addListener(elements.menuBtn, 'click', (e) => {
        e.stopPropagation();
        elements.dropdownMenu.classList.toggle('hidden');
    });

    // Универсальный обработчик для закрытия/возврата из панелей
    document.querySelectorAll('.panel-overlay').forEach(panel => {
        addListener(panel, 'click', (e) => {
            if (e.target.classList.contains('panel-close-btn') || e.target.classList.contains('panel-back-btn')) {
                handlers.closePanel(panel);
                // Если это кнопка "назад", открываем главную панель настроек
                if (e.target.classList.contains('panel-back-btn')) {
                    handlers.openPanel(elements.settingsPanel);
                }
            }
        });
    });
    
    // Открытие панелей
    const setupPanelButton = (btn, panel, shouldCloseDropdown = false) => {
        addListener(btn, 'click', () => {
            if (shouldCloseDropdown) elements.dropdownMenu.classList.add('hidden');
            handlers.openPanel(panel);
        });
    };
    setupPanelButton(elements.settingsOpenBtn, elements.settingsPanel, true);
    setupPanelButton(elements.themePanelOpenBtn, elements.themePanel);
    setupPanelButton(elements.backgroundPanelOpenBtn, elements.backgroundPanel);
    setupPanelButton(elements.changelogOpenBtn, elements.changelogPanel);
    setupPanelButton(elements.bugReportOpenBtn, elements.bugReportPanel);
    setupPanelButton(elements.suggestionOpenBtn, elements.suggestionPanel);
    
    // --- Основные действия генератора ---
    addListener(elements.generateBtn, 'click', handlers.handleAiGeneration);
    addListener(elements.randomPromptBtn, 'click', handlers.generateRandomPrompt);
    addListener(elements.findSimilarBtn, 'click', handlers.findSimilarOnline);
    addListener(elements.randomImageBtn, 'click', handlers.getRandomImage);
    addListener(elements.saveBtn, 'click', handlers.saveResultToGallery);
    addListener(elements.previewBtn, 'click', handlers.previewResult);

    // --- Действия с галереей ---
    addListener(elements.uploadBtn, 'click', () => elements.uploadInput.click());
    addListener(elements.uploadInput, 'change', handlers.handleUpload);
    addListener(elements.exportBtn, 'click', handlers.exportSelected);
    addListener(elements.deleteBtn, 'click', handlers.deleteSelected);
    addListener(elements.clearGalleryBtn, 'click', handlers.clearGallery);
    addListener(elements.setBgFromGalleryBtn, 'click', handlers.setBackgroundFromGallery);
    addListener(elements.langSwitcherBtn, 'click', () => {
        const nextLang = document.documentElement.lang === 'ru' ? 'en' : 'ru';
        handlers.setLanguage(nextLang);
    });
    
    // --- Обратная связь ---
    addListener(elements.submitBugReportBtn, 'click', () => handlers.handleFeedbackSubmit('bug'));
    addListener(elements.submitSuggestionBtn, 'click', () => handlers.handleFeedbackSubmit('suggestion'));
    
    // ⭐ ИСПРАВЛЕНО: Управление выбором через новые кнопки
    addListener(elements.selectAllBtn, 'click', () => handlers.selectAllItems(true));
    addListener(elements.deselectAllBtn, 'click', () => handlers.selectAllItems(false));
    addListener(elements.selectAiBtn, 'click', handlers.selectAiItems);
    
    // --- Выбор темы и фона ---
    addListener(elements.themeGrid, 'click', (e) => {
        const themeEl = e.target.closest('[data-theme]');
        if (themeEl) handlers.applyTheme(themeEl.dataset.theme);
    });
    addListener(elements.themeResetBtn, 'click', () => handlers.applyTheme('dark')); // Сброс на темную тему
    
    addListener(elements.backgroundGrid, 'click', (e) => {
        const bgCard = e.target.closest('[data-bg-id]');
        if (bgCard) handlers.setBackgroundFromDefault(bgCard.dataset.bgId);
    });
    addListener(elements.backgroundResetBtn, 'click', handlers.resetBackground);
    addListener(elements.backgroundUploadInput, 'change', handlers.handleBackgroundUpload);
    
    // --- Контекстное меню ---
    addListener(elements.contextMenu, 'click', (e) => {
        const action = e.target.dataset.action;
        if (action) handlers.handleContextMenuAction(action);
    });
};
