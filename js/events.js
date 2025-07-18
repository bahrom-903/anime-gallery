// =================================================================
//      ФАЙЛ: events.js
//      РОЛЬ: Привязка всех обработчиков событий к DOM-элементам
// =================================================================
import { getState } from './state.js';

export const setupEventListeners = (elements, handlers) => {
    
    // БЛОК 1: ГЛОБАЛЬНЫЕ КЛИКИ (BODY)
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

    // БЛОК 2: УПРАВЛЕНИЕ ПАНЕЛЯМИ
    // Закрытие просмотрщика по клику на фон
    if (elements.imageViewer) {
        elements.imageViewer.addEventListener('click', (e) => {
            // Закрываем только если клик был на самом оверлее, а не на картинке внутри
            if (e.target.classList.contains('image-viewer-overlay')) {
                handlers.closePanel(elements.imageViewer);
            }
        });
    }

    // Закрытие всех панелей по кнопкам "X" и "<-"
    document.querySelectorAll('.panel-overlay').forEach(panel => {
        panel.addEventListener('click', (e) => {
            const target = e.target;
            const closeBtn = target.closest('.panel-close-btn');
            const backBtn = target.closest('.panel-back-btn');

            if (closeBtn) {
                handlers.closePanel(panel);
            } else if (backBtn) {
                handlers.closePanel(panel);
                if (elements.settingsPanel) {
                    handlers.openPanel(elements.settingsPanel);
                }
            }
        });
    });

    // Открытие панелей
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
    setupPanelButton(elements.changelogOpenBtn, elements.changelogPanel);
    setupPanelButton(elements.bugReportOpenBtn, elements.bugReportPanel);
    setupPanelButton(elements.suggestionOpenBtn, elements.suggestionPanel);


    // БЛОК 3: УПРАВЛЕНИЕ ГЕНЕРАТОРОМ
    if (elements.menuBtn) {
        elements.menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (elements.dropdownMenu) {
                elements.dropdownMenu.classList.toggle('hidden');
            }
        });
    }
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


    // БЛОК 4: УПРАВЛЕНИЕ ГАЛЕРЕЕЙ
    if (elements.uploadBtn) elements.uploadBtn.addEventListener('click', () => elements.uploadInput.click());
    if (elements.uploadInput) elements.uploadInput.addEventListener('change', handlers.handleUpload);
    if (elements.exportBtn) elements.exportBtn.addEventListener('click', handlers.exportSelected);
    if (elements.deleteBtn) elements.deleteBtn.addEventListener('click', handlers.deleteSelected);
    if (elements.setBgFromGalleryBtn) elements.setBgFromGalleryBtn.addEventListener('click', handlers.setBgFromGalleryBtn);
    if (elements.clearGalleryBtn) elements.clearGalleryBtn.addEventListener('click', handlers.clearGallery);
    
    // Новый единый обработчик для панели управления
    if (elements.selectionControls) {
        elements.selectionControls.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const action = button.dataset.action;
            const sort = button.dataset.sort;
            const filter = button.dataset.filter;

            if (action === 'select_all') {
                handlers.selectAllItems();
            } else if (action === 'select_ai') {
                handlers.selectAiItems();
            } else if (sort) {
                handlers.handleSort(sort);
            } else if (filter) {
                handlers.handleFilter();
            }
        });
    }

    // БЛОК 5: УПРАВЛЕНИЕ КАСТОМИЗАЦИЕЙ (ТЕМЫ, ФОНЫ)
    if (elements.themeResetBtn) elements.themeResetBtn.addEventListener('click', () => handlers.applyTheme('dark'));
    if (elements.backgroundResetBtn) elements.backgroundResetBtn.addEventListener('click', handlers.resetBackground);
    
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
    }
    
    if (elements.backgroundUploadInput) elements.backgroundUploadInput.addEventListener('change', handlers.handleBackgroundUpload);

    if (elements.themeGrid) {
        elements.themeGrid.addEventListener('click', (e) => {
            const themeEl = e.target.closest('[data-theme]');
            if (themeEl) handlers.applyTheme(themeEl.dataset.theme);
        });
    }

    // БЛОК 6: ПРОЧИЕ ОБРАБОТЧИКИ
    if (elements.langSwitcherBtn) {
        elements.langSwitcherBtn.addEventListener('click', () => {
            const nextLang = getState().currentLanguage === 'ru' ? 'en' : 'ru';
            handlers.setLanguage(nextLang);
        });
    }
    
    if (elements.submitBugReportBtn) elements.submitBugReportBtn.addEventListener('click', () => handlers.handleFeedbackSubmit('bug'));
    if (elements.submitSuggestionBtn) elements.submitSuggestionBtn.addEventListener('click', () => handlers.handleFeedbackSubmit('suggestion'));
    
    if (elements.contextMenu) {
        elements.contextMenu.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (action) handlers.handleContextMenuAction(action);
        });
    }
};
