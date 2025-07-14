/**
 * js/main.js
 * 
 * Главный файл приложения, точка входа.
 * Отвечает за инициализацию всех модулей и запуск приложения.
 */

// Импорт компонентов и ядерных модулей будет происходить
// только после того, как DOM будет готов.

// --- Главная функция инициализации приложения ---

async function initializeApp() {
    // Теперь мы импортируем все ВНУТРИ асинхронной функции.
    // Это гарантирует, что код модулей не выполнится до готовности DOM.
    const elements = await import('./elements.js');
    const { applyTranslations } = await import('./core/i18n.js');
    const { initializeThemeAndBackground } = await import('./core/themeManager.js');
    const { initializeGenerator } = await import('./components/generator.js');
    const { initializeGallery } = await import('./components/gallery.js');
    
    // 1. Применяем переводы ко всему интерфейсу
    applyTranslations();

    // 2. Инициализируем сохраненную тему и фон
    await initializeThemeAndBackground();

    // 3. "Оживляем" компонент генератора
    initializeGenerator();

    // 4. "Оживляем" компонент галереи
    initializeGallery();

    // ... в будущем здесь будут другие инициализации ...

    console.log('Приложение успешно инициализировано!');
}


// --- Запуск приложения ---

// Мы ждем, пока весь HTML-документ будет полностью загружен и разобран браузером.
// И только ПОСЛЕ этого запускаем нашу главную функцию.
// Это и есть решение проблемы "элемент не найден".
document.addEventListener('DOMContentLoaded', initializeApp);
