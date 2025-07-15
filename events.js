// =================================================================
//          events.js: ФИНАЛЬНЫЙ АККОРД. ЗАМЕНИТЬ ПОЛНОСТЬЮ.
// =================================================================

import { getState } from './state.js';
import * as ui from './ui.js';

export const setupEventListeners = (elements, handlers) => {
    // Глобальные клики для закрытия меню
    document.body.addEventListener('click', (e) => {
        if (elements.menuBtn && !elements.menuBtn.contains(e.target) && elements.dropdownMenu && !elements.dropdownMenu.contains(e.target)) {
            elements.dropdownMenu.classList.add('hidden');
        }
        if (elements.contextMenu && !elements.contextMenu.contains(e.target) && !e.target.classList.contains('item-menu-btn')) {
            ui.hideContextMenu(elements);
        }
        if(elements.sortMenu && !elements.sortMenu.contains(e.target) && !e.target.classList.contains('gallery-action-btn')) {
            ui.hideSortMenu(elements);
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
            if (target?.classList.contains('panel-close-btn')) {
                ui.closePanel(panel);
            } else if (target?.classList.contains('panel-back-btn')) {
                ui.closePanel(panel);
                // Для панелей "Зала славы", "Баг-репорта" и "Идеи" кнопка "Назад" должна вести в Настройки
                if (panel === elements.changelogPanel || panel === elements.bugReportPanel || panel === elements.suggestionPanel) {
                    ui.openPanel(elements.settingsPanel);
                }
            } else if (e.target === panel) {
                ui.closePanel(panel);
            }
        });
    });

    // Навигация по панелям
    const setupPanelButton = (btn, panel, shouldCloseDropdown = false) => {
        if(btn) btn.addEventListener('click', () => {
            if(shouldCloseDropdown) elements.dropdownMenu.classList.add('hidden');
            ui.openPanel(panel);
        });
    };
    setupPanelButton(elements.settingsOpenBtn, elements.settingsPanel, true);
    setupPanelButton(elements.themePanelOpenBtn, elements.themePanel);
    setupPanelButton(elements.backgroundPanelOpenBtn, elements.backgroundPanel);
    setupPanelButton(elements.changelogOpenBtn, elements.changelogPanel);
    setupPanelButton(elements.bugReportOpenBtn, elements.bugReportPanel);
    setupPanelButton(elements.suggestionOpenBtn, elements.suggestionPanel);

    // Основные действия генератора
    elements.generateBtn.addEventListener('click', handlers.handleAiGeneration);
    elements.randomPromptBtn.addEventListener('click', handlers.generateRandomPrompt);
    elements.findSimilarBtn.addEventListener('click', handlers.findSimilarOnline);
    elements.randomImageBtn.addEventListener('click', handlers.getRandomImage);
    elements.saveBtn.addEventListener('click', handlers.saveResultToGallery);
    elements.previewBtn.addEventListener('click', () => { const lastResult = getState().lastAiResult; if (lastResult) handlers.viewImage(lastResult.imageUrl); });

    // Действия с галереей
    elements.uploadBtn.addEventListener('click', () => elements.uploadInput.click());
    elements.uploadInput.addEventListener('change', handlers.handleUpload);
    elements.exportBtn.addEventListener('click', handlers.exportSelected);
    elements.deleteBtn.addEventListener('click', handlers.deleteSelected);
    elements.themeResetBtn.addEventListener('click', () => handlers.applyTheme('dark'));
    elements.backgroundResetBtn.addEventListener('click', handlers.resetBackground);
    elements.setBgFromGalleryBtn.addEventListener('click', handlers.setBackgroundFromGallery);
    
    // Новая логика для кнопки загрузки фона
    elements.backgroundGrid.addEventListener('click', (e) => {
        const uploadCard = e.target.closest('#background-upload-card');
        if (uploadCard) {
            elements.backgroundUploadInput.click();
            return;
        }
        const bgCard = e.target.closest('[data-bg-id]');
        if (bgCard) {
            handlers.setBackgroundFromDefault(bgCard.dataset.bgId);
        }
    });
    elements.backgroundUploadInput.addEventListener('change', handlers.handleBackgroundUpload);
    
    // Язык, обратная связь
    elements.langSwitcherBtn.addEventListener('click', () => handlers.setLanguage(getState().currentLanguage === 'ru' ? 'en' : 'ru'));
    elements.submitBugReportBtn.addEventListener('click', () => handlers.handleFeedbackSubmit('bug'));
    elements.submitSuggestionBtn.addEventListener('click', () => handlers.handleFeedbackSubmit('suggestion'));
    
    // Управление выбором и сортировкой
    elements.selectAllCheckbox.addEventListener('change', (e) => handlers.selectAllItems(e.target.checked));
    elements.selectAiBtn.addEventListener('click', (e) => { e.preventDefault(); handlers.selectAiItems(); });
    elements.favFilterActionBtn.addEventListener('click', handlers.handleFavFilter);
    elements.sortActionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        ui.showSortMenu(elements, e.currentTarget, handlers);
    });
    
    // Выбор темы
    elements.themeGrid.addEventListener('click', (e) => {
        const themeEl = e.target.closest('[data-theme]');
        if (themeEl) handlers.applyTheme(themeEl.dataset.theme);
    });
    
    // Контекстное меню
    elements.contextMenu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if(action) handlers.handleContextMenuAction(action);
    });
};
