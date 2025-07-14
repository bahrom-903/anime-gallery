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


/**
 * Управляет состоянием UI генератора (кнопки, лоадер, сообщения).
 * @param {boolean} isLoading - Поставить в `true` для начала загрузки, `false` для окончания.
 * @param {string} [message=''] - Сообщение для лоадера.
 */
function setGeneratorUiState(isLoading, message = '') {
    // Включаем/выключаем все кнопки генератора
    const buttons = [elements.generateBtn, elements.findSimilarBtn, elements.randomImageBtn, elements.randomPromptBtn];
    buttons.forEach(btn => {
        if (btn) btn.disabled = isLoading;
    });

    // Показываем/скрываем лоадер
    elements.loader.classList.toggle('hidden', !isLoading);
    if (isLoading) {
        elements.loaderText.textContent = message;
    }

    // При начале новой загрузки очищаем предыдущий результат и ошибки
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
    // Сохраняем результат в глобальное состояние
    updateState({ lastAiResult: { imageUrl, prompt, isAiGenerated } });

    const img = new Image();
    img.crossOrigin = "Anonymous"; // Важно для сохранения в галерею
    img.src = imageUrl;
    img.alt = prompt;

    img.onload = () => {
        elements.imageContainer.innerHTML = ''; // Очищаем контейнер
        elements.imageContainer.appendChild(img);
        elements.resultControls.classList.remove('hidden');
    };
    img.onerror = () => {
        showError(t('error_network')); // Показываем ошибку, если картинка не загрузилась
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
        showError('Введите описание для генерации.'); // TODO: перевести
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

async function handleFindSimilar() {
    // TODO: Добавить логику получения URL для поиска из state.js
    showError("Функция 'Найти в сети' в разработке.");
}

async function handleGetRandom() {
     // TODO: Добавить логику получения URL для случайного из state.js
    showError("Функция 'Случайное' в разработке.");
}

function handleRandomPrompt() {
    const brain = RANDOM_PROMPT_BRAIN[reactive.currentCategory] || RANDOM_PROMPT_BRAIN.default;
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randomPrompt = `${getRandomElement(brain.subject)}, ${getRandomElement(brain.details)}, ${getRandomElement(brain.style)}`;
    elements.promptInput.value = randomPrompt;
}

/**
 * Инициализация компонента "Генератор".
 * Навешивает все обработчики событий и настраивает начальное состояние.
 */
export function initializeGenerator() {
    // Заполняем селектор стилей
    for (const [id, value] of Object.entries(AI_STYLES)) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = t(`style_${id}`);
        elements.styleSelector.appendChild(option);
    }

    // Навешиваем обработчики на кнопки
    elements.generateBtn.addEventListener('click', handleAiGeneration);
    elements.findSimilarBtn.addEventListener('click', handleFindSimilar);
    elements.randomImageBtn.addEventListener('click', handleGetRandom);
    elements.randomPromptBtn.addEventListener('click', handleRandomPrompt);

    // TODO: Добавить обработчики для кнопок 'Сохранить' и 'Предпросмотр'
}
