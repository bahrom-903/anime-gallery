/**
 * js/core/i18n.js
 * 
 * Модуль интернационализации (i18n).
 * Отвечает за хранение всех текстовых строк и переключение языков.
 */

import { reactive } from '../state.js';

// ===================================================================
//                        СЛОВАРЬ ПЕРЕВОДОВ
// ===================================================================

const translations = {
    // Русский язык
    ru: {
        // Заголовки
        gallery: 'Галерея',
        settings: 'Настройки',
        themes: 'Темы оформления',
        backgrounds: 'Фоновые изображения',
        sorting: 'Сортировка галереи',
        changelog: 'Что нового',
        report_bug: 'Сообщить об ошибке',
        suggest_idea: 'Предложить идею',
        auth_title: 'Вход / Регистрация',
        
        // Кнопки
        generate_ai: 'Генерация AI',
        find_online: 'Найти в сети',
        random_image: 'Случайное',
        save: 'Сохранить',
        preview: 'Предпросмотр',
        upload_yours: 'Загрузить свое',
        export: 'Экспорт',
        set_as_bg: 'Фоном',
        delete: 'Удалить',
        clear_gallery: 'Очистить галерею',
        language: 'Сменить язык',
        upload_your_bg: 'Загрузить свой фон',
        send: 'Отправить',
        login_signup: 'Войти / Регистрация',
        login: 'Войти',
        register: 'Регистрация',
        
        // Плейсхолдеры и метки
        prompt_placeholder: 'Опишите ваше изображение...',
        negative_prompt_placeholder: 'Что не нужно рисовать...',
        select_all_label: 'Выбрать всё',
        select_ai_only_label: 'Выбрать только AI',

        // Категории
        cat_waifu: 'Девушки',
        cat_anime_gif: 'GIF',
        cat_cyberpunk: 'Киберпанк',
        cat_nature: 'Природа',
        cat_games: 'Игры',
        cat_dark_anime: 'Дарк-фэнтези',
        cat_supercars: 'Суперкары',
        
        // Стили
        style_no_style: 'Без стиля',
        style_anime: 'Аниме',
        style_photorealistic: 'Фотореализм',
        style_fantasy: 'Фэнтези',
        style_cyberpunk_style: 'Киберпанк',
        style_digital_painting: 'Цифр. живопись',
        style_low_poly: 'Low Poly',
        
        // Сортировка
        sort_newest: 'Сначала новые',
        sort_oldest: 'Сначала старые',
        sort_random: 'Случайный порядок',
        sort_favorites: 'Только избранные',

        // Контекстное меню
        ctx_rename: 'Переименовать',
        ctx_copy_prompt: 'Копировать промпт',

        // Формы и сообщения
        bug_report_desc: 'Пожалуйста, подробно опишите ошибку: что вы делали, что произошло, и что вы ожидали увидеть.',
        suggestion_desc: 'Поделитесь своей идеей о том, как можно улучшить приложение.',
        bug_report_placeholder: 'Например: "Когда я нажимаю на кнопку Экспорт, ничего не происходит. Браузер Chrome."',
        suggestion_placeholder: 'Например: "Было бы здорово добавить категорию с котиками!"',
        email_placeholder: 'Введите ваш email',
        password_placeholder: 'Введите ваш пароль',

        // Сообщения об ошибках и статусы
        error_generic: 'Произошла неизвестная ошибка.',
        error_upload: 'Ошибка загрузки файла.',
        error_network: 'Сетевая ошибка. Проверьте подключение.',
        status_sending: 'Отправка...',
        status_sent_success: 'Спасибо! Ваше сообщение отправлено.',
        status_loading_gallery: 'Загрузка галереи...',
        status_gallery_empty: 'В этой категории пока нет изображений. Попробуйте сгенерировать что-нибудь!',
        error_gallery_load: 'Не удалось загрузить галерею.',
        error_prompt_empty: 'Пожалуйста, введите описание для генерации.',
    },

    // Английский язык
    en: {
        // Titles
        gallery: 'Gallery',
        settings: 'Settings',
        themes: 'Appearance Themes',
        backgrounds: 'Background Images',
        sorting: 'Gallery Sorting',
        changelog: 'What\'s new',
        report_bug: 'Report a Bug',
        suggest_idea: 'Suggest an Idea',
        auth_title: 'Login / Sign Up',

        // Buttons
        generate_ai: 'Generate AI',
        find_online: 'Find Online',
        random_image: 'Random',
        save: 'Save',
        preview: 'Preview',
        upload_yours: 'Upload Yours',
        export: 'Export',
        set_as_bg: 'Set as BG',
        delete: 'Delete',
        clear_gallery: 'Clear Gallery',
        language: 'Switch Language',
        upload_your_bg: 'Upload Your BG',
        send: 'Send',
        login_signup: 'Login / Sign Up',
        login: 'Login',
        register: 'Register',
        
        // Placeholders & Labels
        prompt_placeholder: 'Describe your image...',
        negative_prompt_placeholder: 'What to avoid drawing...',
        select_all_label: 'Select all',
        select_ai_only_label: 'Select AI only',

        // Categories
        cat_waifu: 'Girls',
        cat_anime_gif: 'GIFs',
        cat_cyberpunk: 'Cyberpunk',
        cat_nature: 'Nature',
        cat_games: 'Games',
        cat_dark_anime: 'Dark Fantasy',
        cat_supercars: 'Supercars',

        // Styles
        style_no_style: 'No Style',
        style_anime: 'Anime',
        style_photorealistic: 'Photorealistic',
        style_fantasy: 'Fantasy',
        style_cyberpunk_style: 'Cyberpunk',
        style_digital_painting: 'Digital Painting',
        style_low_poly: 'Low Poly',

        // Sorting
        sort_newest: 'Newest first',
        sort_oldest: 'Oldest first',
        sort_random: 'Random order',
        sort_favorites: 'Favorites only',

        // Context Menu
        ctx_rename: 'Rename',
        ctx_copy_prompt: 'Copy Prompt',

        // Forms & Messages
        bug_report_desc: 'Please describe the bug in detail: what you did, what happened, and what you expected to happen.',
        suggestion_desc: 'Share your idea on how to improve the application.',
        bug_report_placeholder: 'E.g., "When I click the Export button, nothing happens. I use Chrome browser."',
        suggestion_placeholder: 'E.g., "It would be great to add a category with kittens!"',
        email_placeholder: 'Enter your email',
        password_placeholder: 'Enter your password',
        
        // Error & Status Messages
        error_generic: 'An unknown error occurred.',
        error_upload: 'File upload error.',
        error_network: 'Network error. Please check your connection.',
        status_sending: 'Sending...',
        status_sent_success: 'Thank you! Your message has been sent.',
        status_loading_gallery: 'Loading gallery...',
        status_gallery_empty: 'There are no images in this category yet. Try generating something!',
        error_gallery_load: 'Failed to load gallery.',
        error_prompt_empty: 'Please enter a description to generate.',
    }
};

/**
 * Получает переведенную строку по ключу.
 * @param {string} key Ключ для перевода (например, 'gallery' или 'cat_waifu').
 * @returns {string} Переведенная строка или сам ключ, если перевод не найден.
 */
export function t(key) {
    const lang = reactive.currentLanguage;
    return translations[lang]?.[key] || translations['ru']?.[key] || key;
}

/**
 * Применяет переводы ко всем элементам на странице с атрибутом data-lang-key.
 */
export function applyTranslations() {
    document.querySelectorAll('[data-lang-key]').forEach(el => {
        const key = el.dataset.langKey;
        el.textContent = t(key);
    });
    
    document.querySelectorAll('[data-lang-placeholder-key]').forEach(el => {
        const key = el.dataset.langPlaceholderKey;
        el.placeholder = t(key);
    });
}
