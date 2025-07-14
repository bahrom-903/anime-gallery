// ===================================
//      Файл: api.js
// ===================================

/**
 * Универсальная функция для отправки запросов на наш бэкенд-сервер.
 * Обрабатывает показ лоадера, ошибки и отображение результата.
 * @param {string} endpoint - Конечная точка на сервере (например, '/generate-image').
 * @param {object} body - Тело запроса, которое будет отправлено в JSON.
 * @param {object} ui - Объект с UI-функциями { setUIGeneratorState, displayGeneratedImage, showError }.
 * @param {string} loadingMessage - Сообщение для лоадера во время запроса.
 * @param {string} successMessage - Сообщение для лоадера после успешного получения ответа.
 * @param {string} promptForDisplay - Текст промпта для отображения в alt картинки.
 */
export const handleServerRequest = async (endpoint, body, ui, { loadingMessage, successMessage, promptForDisplay }) => {
    ui.setUIGeneratorState(true, loadingMessage);
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const result = await response.json();
        
        if (!response.ok) {
            // Если сервер вернул ошибку, она будет в result.error
            throw new Error(result.error || 'Неизвестная ошибка сервера');
        }

        ui.setUIGeneratorState(true, successMessage);
        await ui.displayGeneratedImage(result.imageUrl, promptForDisplay, result.isAiGenerated);

    } catch (e) {
        console.error(`Ошибка в handleServerRequest для эндпоинта ${endpoint}:`, e);
        ui.showError(`Ошибка: ${e.message}`);
    } finally {
        ui.setUIGeneratorState(false);
    }
};
