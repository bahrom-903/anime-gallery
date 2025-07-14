/**
 * js/components/generator.js
 * 
 * Логика компонента "Генератор". Управляет вводом промптов,
 * кнопками генерации, отображением лоадера и результатов.
 */

// Импортируем "щупальца" к DOM-элементам
import * as elements from '../elements.js';
// Импортируем "мозг" (состояние)
import { reactive, updateState, AI_STYLES, RANDOM_PROMPT_BRAIN } from '../state.js';
// Импортируем API для общения с сервером
import { generateAiImage, getImageFromSource } from '../api/generation.js';
// Импортируем локализацию
import { t } from '../core/i18n.js';
// Импортируем функцию добавления в галерею
import { addImageToGallery } from './gallery.js';


/**
 * Управляет состоянием UI генератора (кнопки, лоадер, сообщения).
 * @param {boolean} isLoading - Поставить в `true` для начала загрузки, `false` для окончания.
 * @param {string} [message=''] - Сообщение для лоадера.
 */
function setGeneratorUiState(isLoading, message = '') {
    const buttons = [elements.generateBtn, elements.findSimilarBtn, elements.randomImageBtn, elements.randomPromptBtn];
    buttons.forEach(btn => {
        if (btn) btn.disabled = isLoading;
    });

    elements.loader.classList.toggle('hidden', !isLoading);
    if (isLoading) {
        elements.loaderText.textContent = message;
    }

    if (isLoading) {
        elements.imageContainer.innerHTML = '';
        elements.errorMessage.classList.add('hidden');
        elements.resultControls.classList.add('hidden');
    }

    updateState({ isGenerating: isLoading });
}

/**
 * Отображает сгенерированное или найденное изображение.
 * @param {string} imageUrl - URL изображения.
 * @param {string} prompt - Промпт, связанный с изображением.
 * @param {boolean} isAiGenerated - Флаг, является ли изображение AI-генерацией.
 */
function displayImage(imageUrl, prompt, isAiGenerated) {
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
        showError(t('error_network'));
        setGeneratorUiState(false);
    };
}

/**
 * Показывает сообщение об ошибке в области генератора.
 * @param {string} message - Текст ошибки.
 */
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.remove('hidden');
}


// --- Обработчики событий ---

async function handleAiGeneration() {
    const userPrompt = elements.promptInput.value.trim();
    const stylePrompt = elements.styleSelector.value;
    const negativePrompt = elements.negativePromptInput.value.trim();
    const category = reactive.currentCategory;

    if (!userPrompt) {
        showError('Введите описание для генерации.');
        return;
    }

    const finalPrompt = `${userPrompt}${stylePrompt}`;
    setGeneratorUiState(true, 'AI-генерация...');

    try {
        const result = await generateAiImage(finalPrompt, negativePrompt, category);
        displayImage(result.imageUrl, userPrompt, result.isAiGenerated);
    } catch (error) {
        showError(error.message);
    } finally {
        setGeneratorUiState(false);
    }
}

async function handleSaveToGallery() {
    if (!reactive.lastAiResult) return;

    setGeneratorUiState(true, 'Сохранение...');
    try {
        const response = await fetch(reactive.lastAiResult.imageUrl);
        if (!response.ok) throw new Error('Сетевая ошибка при скачивании изображения');
        
        const blob = await response.blob();

        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        
        await addImageToGallery(
            dataUrl,
            reactive.lastAiResult.prompt,
            reactive.lastAiResult.isAiGenerated
        );

    } catch (error) {
        console.error(error);
        showError("Ошибка сохранения: " + error.message);
    } finally {
        setGeneratorUiState(false);
    }
}


async function handleFindSimilar() {
    showError("Функция 'Найти в сети' в разработке.");
}

async function handleGetRandom() {
    showError("Функ-я 'Случайное' в разработке.");
}

function handleRandomPrompt() {
    const brain = RANDOM_PROMPT_BRAIN[reactive.currentCategory] || RANDOM_PROMPT_BRAIN.default;
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randomPrompt = `${getRandomElement(brain.subject)}, ${getRandomElement(brain.details)}, ${getRandomElement(brain.style)}`;
    elements.promptInput.value = randomPrompt;
}

/**
 * Инициализация компонента "Генератор".
 */
export function initializeGenerator() {
    for (const [id, value] of Object.entries(AI_STYLES)) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = t(`style_${id}`);
        elements.styleSelector.appendChild(option);
    }

    elements.generateBtn.addEventListener('click', handleAiGeneration);
    elements.findSimilarBtn.addEventListener('click', handleFindSimilar);
    elements.randomImageBtn.addEventListener('click', handleGetRandom);
    elements.randomPromptBtn.addEventListener('click', handleRandomPrompt);
    elements.saveBtn.addEventListener('click', handleSaveToGallery);
}
