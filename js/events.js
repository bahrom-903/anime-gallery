import { getState } from './state.js';

export const setupEventListeners = (elements, handlers) => {
    
    document.body.addEventListener('click', (e) => {
        if (elements.menuBtn && !elements.menuBtn.contains(e.target) && elements.dropdownMenu && !elements.dropdownMenu.contains(e.target)) {
            elements.dropdownMenu.classList.add('hidden');
        }
        if (elements.contextMenu && !elements.contextMenu.contains(e.target) && !e.target.classList.contains('item-menu-btn')) {
            handlers.hideContextMenu();
        }
    });

    if (elements.imageViewer) {
        elements.imageViewer.addEventListener('click', (e) => {
            if (e.target === elements.imageViewer) {
                handlers.closePanel(elements.imageViewer);
            }
        });
    }

    if (elements.menuBtn) {
        elements.menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (elements.dropdownMenu) elements.dropdownMenu.classList.toggle('hidden');
        });
    }

    document.querySelectorAll('.panel-overlay').forEach(panel => {
        panel.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('panel-close-btn') || target.closest('.panel-close-btn')) {
                handlers.closePanel(panel);
            }
            else if (target.classList.contains('panel-back-btn') || target.closest('.panel-back-btn')) {
                handlers.closePanel(panel);
                if (elements.settingsPanel) handlers.openPanel(elements.settingsPanel);
            }
        });
    });

    const setupPanelButton = (btn, panel, shouldCloseDropdown = false) => {
        if (btn) btn.addEventListener('click', () => {
            if (shouldCloseDropdown && elements.dropdownMenu) elements.dropdownMenu.classList.add('hidden');
            handlers.openPanel(panel);
        });
    };
    setupPanelButton(elements.settingsOpenBtn, elements.settingsPanel, true);
    setupPanelButton(elements.themePanelOpenBtn, elements.themePanel);
    setupPanelButton(elements.backgroundPanelOpenBtn, elements.backgroundPanel);
    setupPanelButton(elements.changelogOpenBtn, elements.changelogPanel);
    setupPanelButton(elements.bugReportOpenBtn, elements.bugReportPanel);
    setupPanelButton(elements.suggestionOpenBtn, elements.suggestionPanel);

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

    if (elements.uploadBtn) elements.uploadBtn.addEventListener('click', () => elements.uploadInput.click());
    if (elements.uploadInput) elements.uploadInput.addEventListener('change', handlers.handleUpload);
    if (elements.exportBtn) elements.exportBtn.addEventListener('click', handlers.exportSelected);
    if (elements.deleteBtn) elements.deleteBtn.addEventListener('click', handlers.deleteSelected);
    if (elements.setBgFromGalleryBtn) elements.setBgFromGalleryBtn.addEventListener('click', handlers.setBgFromGalleryBtn);
    if (elements.clearGalleryBtn) elements.clearGalleryBtn.addEventListener('click', handlers.clearGallery);
    
    if (elements.themeResetBtn) elements.themeResetBtn.addEventListener('click', () => handlers.applyTheme('dark'));
    if (elements.backgroundResetBtn) elements.backgroundResetBtn.addEventListener('click', handlers.resetBackground);
    
    if (elements.backgroundGrid) {
        elements.backgroundGrid.addEventListener('click', (e) => {
            const bgCard = e.target.closest('[data-bg-id]');
            if (bgCard) {
                if (bgCard.dataset.bgId === 'upload-new') {
                    if (elements.backgroundUploadInput) elements.backgroundUploadInput.click();
                } else {
                    handlers.setBackgroundFromDefault(bgCard.dataset.bgId);
                }
            }
        });
    }
    
    if (elements.backgroundUploadInput) elements.backgroundUploadInput.addEventListener('change', handlers.handleBackgroundUpload);

    if (elements.langSwitcherBtn) {
        elements.langSwitcherBtn.addEventListener('click', () => {
            const nextLang = getState().currentLanguage === 'ru' ? 'en' : 'ru';
            handlers.setLanguage(nextLang);
        });
    }
    
    if (elements.submitBugReportBtn) elements.submitBugReportBtn.addEventListener('click', () => handlers.handleFeedbackSubmit('bug'));
    if (elements.submitSuggestionBtn) elements.submitSuggestionBtn.addEventListener('click', () => handlers.handleFeedbackSubmit('suggestion'));
    
    if (elements.selectionControls) {
        elements.selectionControls.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const action = button.dataset.action;
            const sort = button.dataset.sort;
            const filter = button.dataset.filter;

            if (action === 'select_all') handlers.selectAllItems();
            else if (action === 'select_ai') handlers.selectAiItems();
            else if (sort) handlers.handleSort(sort);
            else if (filter) handlers.handleFilter();
        });
    }

    if (elements.themeGrid) {
        elements.themeGrid.addEventListener('click', (e) => {
            const themeEl = e.target.closest('[data-theme]');
            if (themeEl) handlers.applyTheme(themeEl.dataset.theme);
        });
    }
    
    if (elements.contextMenu) {
        elements.contextMenu.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            if (action) handlers.handleContextMenuAction(action);
        });
    }
};
