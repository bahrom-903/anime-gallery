/**
 * js/api/generation.js
 * 
 * Модуль для взаимодействия с серверным API в части генерации
 * и получения изображений.
 */

/**
 * Универсальная функция для отправки POST-запросов на сервер.
 * Обрабатывает стандартные ошибки и парсит JSON-ответ.
 * @param {string} endpoint Путь к API (например, '/generate-image').
 * @param {object} body Тело запроса.
 * @returns {Promise<any>} Промис с результатом от сервера.
 * @throws {Error} Выбрасывает ошибку в случае сбоя сети или ответа с ошибкой.
 */
async function post(endpoint, body) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const result = await response.json();

        if (!response.ok) {
            // Если сервер вернул ошибку, используем ее текст
            const errorMessage = result.error || `Ошибка сервера: ${response.status}`;
            throw new Error(errorMessage);
        }

        return result;

    } catch (error) {
        // Если ошибка произошла на уровне сети (например, нет интернета)
        // или при парсинге JSON, будет выброшена эта ошибка.
        console.error(`Ошибка при запросе к ${endpoint}:`, error);
        // Выбрасываем ошибку дальше, чтобы ее можно было поймать в UI
        throw new Error(error.message || 'Сетевая ошибка. Проверьте подключение.');
    }
}


/**
 * Запрашивает у сервера генерацию изображения с помощью AI.
 * @param {string} prompt Текст промпта.
 * @param {string} negativePrompt Текст негативного промпта.
 * @param {string} category Текущая категория (для выбора "мозга" на сервере).
 * @returns {Promise<{imageUrl: string, isAiGenerated: boolean}>} Результат с URL изображения.
 */
export function generateAiImage(prompt, negativePrompt, category) {
    const body = {
        prompt: prompt,
        negative_prompt: negativePrompt,
        category: category
    };
    return post('/generate-image', body);
}

/**
 * Запрашивает у сервера случайное или похожее изображение из внешнего источника.
 * @param {string} sourceUrl URL внешнего API.
 * @returns {Promise<{imageUrl: string}>} Результат с URL изображения.
 */
export function getImageFromSource(sourceUrl) {
    const body = {
        url: sourceUrl
    };
    return post('/get-image-from-source', body);
}
