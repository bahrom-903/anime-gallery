/**
 * js/main.js
 * 
 * Главный файл приложения, точка входа.
 * Отвечает за инициализацию всех модулей и запуск приложения.
 */

// Импорт ядерных модулей
import { applyTranslations } from './core/i18n.js';
import { initializeThemeAndBackground } from './core/themeManager.js';

// Импорт компонентов
import { initializeGenerator } from './components/generator.js';
// ... в будущем здесь будут импорты других компонентов:
// import { initializeGallery } from './components/gallery.js';
// import { initializePanels } from './components/panels.js';
// import { initializeAuth } from './components/auth.js';


// --- Главная функция инициализации приложения ---

function initializeApp() {
    // 1. Применяем переводы ко всему интерфейсу
    applyTranslations();

    // 2. Инициализируем сохраненную тему и фон
    initializeThemeAndBackground();

    // 3. "Оживляем" компонент генератора
    initializeGenerator();

    // 4. "Оживляем" компонент галереи (когда он будет готов)
    // initializeGallery();

    // 5. "Оживляем" все панели (когда они будут готовы)
    // initializePanels();

    // 6. "Оживляем" компонент авторизации (когда он будет готов)
    // initializeAuth();

    console.log('Приложение успешно инициализировано!');
}


// --- Запуск приложения ---

// Мы используем DOMContentLoaded, чтобы быть уверенными, что весь HTML
// уже загружен, прежде чем мы начнем с ним работать.
document.addEventListener('DOMContentLoaded', initializeApp);
