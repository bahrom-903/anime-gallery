/**
 * js/main.js (v3 - Dependency Injection)
 * 
 * Главный файл приложения, точка входа.
 * Отвечает за инициализацию всех модулей и запуск приложения.
 */

import * as elements from './elements.js'; // ЕДИНСТВЕННЫЙ ИМПОРТ ELEMENTS
import { applyTranslations } from './core/i18n.js';
import { initializeThemeAndBackground } from './core/themeManager.js';
import { initializeGenerator } from './components/generator.js';
import { initializeGallery } from './components/gallery.js';

async function initializeApp() {
    console.log('DOM готов. Запускаем инициализацию...');
    
    applyTranslations();
    await initializeThemeAndBackground();

    // ПЕРЕДАЕМ 'elements' КАК АРГУМЕНТ
    initializeGenerator(elements);
    initializeGallery(elements);

    console.log('Приложение успешно инициализировано!');
}

document.addEventListener('DOMContentLoaded', initializeApp);
