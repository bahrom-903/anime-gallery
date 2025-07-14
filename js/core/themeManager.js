/**
 * js/core/themeManager.js
 * 
 * Модуль для управления темами оформления и фоновыми изображениями.
 */

import { DB_CONFIG } from '../state.js';
import { put, get, remove } from './db.js';

const STORE = DB_CONFIG.STORES.SETTINGS;

/**
 * Применяет выбранную тему к документу.
 * @param {string} themeId ID темы для применения (например, 'dark', 'light').
 */
export async function applyTheme(themeId) {
    // Устанавливаем класс на body, который активирует стили из CSS
    document.body.className = themeId ? `theme-${themeId}` : '';
    
    // Если у body уже есть класс для кастомного фона, сохраняем его
    if (document.body.dataset.hasCustomBg === 'true') {
        document.body.classList.add('has-custom-bg');
    }

    // Сохраняем выбор темы в IndexedDB для последующих сессий
    try {
        await put(STORE, themeId, 'currentTheme');
    } catch (error) {
        console.error('Не удалось сохранить тему в IndexedDB:', error);
    }
}

/**
 * Применяет кастомное фоновое изображение.
 * @param {Blob} imageBlob Blob-объект изображения.
 */
export async function applyCustomBackground(imageBlob) {
    try {
        // Сохраняем Blob в IndexedDB. Это позволяет не хранить его в localStorage.
        await put(STORE, imageBlob, 'customBackground');

        // Создаем временный URL для отображения фона
        const objectURL = URL.createObjectURL(imageBlob);
        
        // Устанавливаем CSS-переменную, которая используется в style.css
        document.body.style.setProperty('--bg-image-url', `url(${objectURL})`);
        
        // Добавляем класс и data-атрибут для управления состоянием
        document.body.classList.add('has-custom-bg');
        document.body.dataset.hasCustomBg = 'true';

    } catch (error) {
        console.error('Не удалось применить или сохранить фон:', error);
    }
}

/**
 * Сбрасывает кастомный фон и возвращает к стандартному фону темы.
 */
export async function resetBackground() {
    try {
        // Удаляем фон из IndexedDB
        await remove(STORE, 'customBackground');
        
        // Очищаем CSS-переменную и убираем классы/атрибуты
        document.body.style.removeProperty('--bg-image-url');
        document.body.classList.remove('has-custom-bg');
        document.body.dataset.hasCustomBg = 'false';

    } catch (error) {
        console.error('Не удалось удалить фон из IndexedDB:', error);
    }
}

/**
 * Инициализирует тему и фон при загрузке приложения.
 * Загружает сохраненные значения из IndexedDB.
 */
export async function initializeThemeAndBackground() {
    try {
        // Загружаем сохраненную тему или используем 'dark' по умолчанию
        const savedTheme = await get(STORE, 'currentTheme') || 'dark';
        await applyTheme(savedTheme);

        // Проверяем, есть ли сохраненный кастомный фон
        const savedBgBlob = await get(STORE, 'customBackground');
        if (savedBgBlob instanceof Blob) {
            await applyCustomBackground(savedBgBlob);
        }
    } catch (error) {
        console.error('Критическая ошибка при инициализации темы и фона:', error);
    }
}
