/**
 * js/components/generator.js (v3 - Dependency Injection)
 */
// БОЛЬШЕ НЕТ 'import * as elements'

import { reactive, updateState, AI_STYLES, RANDOM_PROMPT_BRAIN } from '../state.js';
import { generateAiImage, getImageFromSource } from '../api/generation.js';
import { t } from '../core/i18n.js';
import { addImageToGallery } from './gallery.js';

// Все функции теперь используют 'elements', полученные извне
function setGeneratorUiState(elements, isLoading, message = '') {
    const buttons = [elements.generateBtn, elements.findSimilarBtn, elements.randomImageBtn, elements.randomPromptBtn];
    buttons.forEach(btn => btn.disabled = isLoading);
    elements.loader.classList.toggle('hidden', !isLoading);
    if (isLoading) elements.loaderText.textContent = message;
    if (isLoading) {
        elements.imageContainer.innerHTML = '';
        elements.errorMessage.classList.add('hidden');
        elements.resultControls.classList.add('hidden');
    }
    updateState({ isGenerating: isLoading });
}

function displayImage(elements, imageUrl, prompt, isAiGenerated) {
    updateState({ lastAiResult: { imageUrl, prompt, isAiGenerated } });
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.alt = prompt;
    img.onload = () => {
        elements.imageContainer.innerHTML = '';
        elements.imageContainer.appendChild(img);
        elements.resultControls.classList.remove('hidden');
    };
    img.onerror = () => {
        showError(elements, t('error_network'));
        setGeneratorUiState(elements, false);
    };
}

function showError(elements, message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.remove('hidden');
}

// --- Обработчики событий ---
// Теперь каждый обработчик должен знать про 'elements'
async function handleAiGeneration(elements) {
    const userPrompt = elements.promptInput.value.trim();
    if (!userPrompt) {
        showError(elements, t('error_prompt_empty'));
        return;
    }
    const finalPrompt = `${userPrompt}${elements.styleSelector.value}`;
    const negativePrompt = elements.negativePromptInput.value.trim();
    
    setGeneratorUiState(elements, true, 'AI-генерация...');
    try {
        const result = await generateAiImage(finalPrompt, negativePrompt, reactive.currentCategory);
        displayImage(elements, result.imageUrl, userPrompt, result.isAiGenerated);
    } catch (error) {
        showError(elements, error.message);
    } finally {
        setGeneratorUiState(elements, false);
    }
}

async function handleSaveToGallery(elements) {
    if (!reactive.lastAiResult) return;
    setGeneratorUiState(elements, true, 'Сохранение...');
    try {
        const response = await fetch(reactive.lastAiResult.imageUrl);
        if (!response.ok) throw new Error('Сетевая ошибка при скачивании');
        const blob = await response.blob();
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        await addImageToGallery(dataUrl, reactive.lastAiResult.prompt, reactive.lastAiResult.isAiGenerated);
    } catch (error) {
        showError(elements, "Ошибка сохранения: " + error.message);
    } finally {
        setGeneratorUiState(elements, false);
    }
}

function handleRandomPrompt(elements) {
    const brain = RANDOM_PROMPT_BRAIN[reactive.currentCategory] || RANDOM_PROMPT_BRAIN.default;
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    elements.promptInput.value = `${getRandomElement(brain.subject)}, ${getRandomElement(brain.details)}, ${getRandomElement(brain.style)}`;
}

// ГЛАВНОЕ ИЗМЕНЕНИЕ: Функция инициализации теперь ПРИНИМАЕТ 'elements'
export function initializeGenerator(elements) {
    for (const [id, value] of Object.entries(AI_STYLES)) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = t(`style_${id}`);
        elements.styleSelector.appendChild(option);
    }
    elements.generateBtn.addEventListener('click', () => handleAiGeneration(elements));
    elements.saveBtn.addEventListener('click', () => handleSaveToGallery(elements));
    elements.randomPromptBtn.addEventListener('click', () => handleRandomPrompt(elements));
}
