// ===================================
//      Файл: config.js
//      Роль: Центральный конфигурационный файл для фронтенда
// ===================================

// --- Настройки Базы Данных ---
export const DB_NAME = 'AnimeGalleryDB_V2_Refactored'; // Новое имя для новой структуры
export const DB_VERSION = 1;
export const STORE_SETTINGS = 'settings';
export const STORE_GALLERY = 'gallery';
export const STORE_BACKGROUNDS = 'defaultBackgrounds';


// --- Настройки Категорий и Источников ---
export const CATEGORIES = {
    'waifu':{sources:{random:'https://api.waifu.im/search/?included_tags=waifu&is_nsfw=false',search:'https://api.waifu.im/search/?included_tags=waifu&is_nsfw=false'}},
    'anime_gif':{sources:{random:'https://api.waifu.im/search/?included_tags=maid&gif=true&is_nsfw=false',search:'https://api.waifu.im/search/?included_tags=uniform&gif=true&is_nsfw=false'}},
    'cyberpunk':{sources:{random:'https://source.unsplash.com/1600x900/?cyberpunk',search:'https://source.unsplash.com/1600x900/?cyberpunk,neon'}},
    'nature':{sources:{random:'https://source.unsplash.com/1600x900/?nature',search:'https://source.unsplash.com/1600x900/?landscape,nature'}},
    'games':{sources:{random:'https://source.unsplash.com/1600x900/?gaming,character',search:'https://source.unsplash.com/1600x900/?video,game,art'}},
    'dark_anime':{sources:{random:'https://source.unsplash.com/1600x900/?dark,fantasy,art',search:'https://source.unsplash.com/1600x900/?gothic,art'}},
    'supercars':{sources:{random:'https://source.unsplash.com/1600x900/?supercar',search:'https://source.unsplash.com/1600x900/?sportscar'}},
};


// --- Настройки Кастомизации ---
export const THEMES = [ { id: "dark" }, { id: "light" }, { id: "gray" }, { id: "retro" }, { id: "dracula" }, { id: "nord" }, { id: "solarized" }, { id: "gruvbox" }, { id: "monokai" }, { id: "tomorrow_night" }, { id: "one_dark" }, { id: "cyberpunk" }, { id: "matrix" }, { id: "crimson" }, { id: "synthwave" } ];

export const STYLES = { 'no_style': '', 'anime': ', anime style, waifu', 'photorealistic': ', photorealistic, 4k, ultra detailed', 'fantasy': ', fantasy art, intricate details, epic scene', 'cyberpunk_style': ', cyberpunk style, neon lights', 'digital_painting': ', digital painting, concept art', 'low_poly': ', low poly, isometric' };

export const DEFAULT_BACKGROUND_SOURCES = [
    { name: 'cyberpunk', url: '../backgrounds/cyberpunk.jpg'}, // Путь изменен на ../
    { name: 'night-tokyo', url: '../backgrounds/night-tokyo.jpg'},
    { name: 'canyon', url: '../backgrounds/canyon.jpg'},
    { name: 'mountain-river', url: '../backgrounds/mountain-river.jpg'},
    { name: 'dark-fantasy', url: '../backgrounds/dark-fantasy.jpg'},
    { name: 'noir-landscape', url: '../backgrounds/noir-landscape.jpg'},
    { name: 'auto-night', url: '../backgrounds/auto-night.jpg'},
    { name: 'anime-city', url: '../backgrounds/anime-city.jpg'},
    { name: 'nier-2b', url: '../backgrounds/nier-2b.jpg'},
    { name: 'genos', url: '../backgrounds/genos.png'}
];


// --- Переводы Интерфейса ---
export const TRANSLATIONS = {
    en: {
        app_title: '🎨 Anime Gallery 🧠 AI-Generator', new_generation: 'New Generation', settings: 'Settings', 
        language: 'Language', generate_ai: '✨ Generate AI', find_online: '🌎 Find Online', random_image: '🎲 Random', 
        save: '💾 Save', preview: '🔍 Preview', gallery: '📁 Gallery', upload_yours: '📥 Upload Yours', 
        export: '📤 Export', set_as_bg: '🏞️ Set as Background', delete: '🗑 Delete', choose_theme: '🎨 Choose Theme', 
        background: '🖼️ Background', sorting: '🔀 Sorting', changelog: '🏆 Hall of Fame & Versions', 
        report_bug: '🐞 Report a Bug', suggest_idea: '💡 Suggest an Idea', clear_gallery: '🗑️ Clear Gallery', 
        themes: '🎨 Themes', backgrounds: '🖼️ Backgrounds', upload_your_bg: '📤 Upload your background', 
        reset_theme: 'Reset Theme', reset_background: 'Reset Background', sort_newest: 'Newest first', 
        sort_oldest: 'Oldest first', sort_random: 'Random', sort_favorites: '✅ Favorites only', cat_waifu: 'Waifu', 
        cat_anime_gif: 'Anime Gifs', cat_cyberpunk: 'Cyberpunk', cat_nature: 'Nature', cat_games: 'Games', 
        cat_dark_anime: 'Dark Anime', cat_supercars: 'Supercars', style_no_style: '-- No Style --', 
        style_anime: 'Anime / Waifu', style_photorealistic: 'Photorealistic', style_fantasy: 'Fantasy Art', 
        style_cyberpunk_style: 'Cyberpunk', style_digital_painting: 'Digital Painting', style_low_poly: '3D (Low Poly)', 
        ctx_rename: 'Rename', ctx_copy_prompt: 'Copy Prompt', prompt_placeholder: "Describe your idea here... (e.g., 'girl with red hair')", 
        negative_prompt_placeholder: "❌ Negative prompt (what NOT to draw)", bug_report_desc: "Please describe the problem in as much detail as possible. What were you doing when it occurred?", 
        bug_report_placeholder: "For example: When I click 'Export', nothing happens...", suggestion_desc: "Have an idea how to make the service better? Tell us!", 
        suggestion_placeholder: "For example: It would be cool to add the ability to change the image size...", 
        send: "Send", select_all_label: 'Select all', select_ai_only_label: 'Select only AI'
    }, 
    ru: {
        app_title: '🎨 Аниме Галерея 🧠 AI-генератор', new_generation: 'Новая генерация', settings: 'Настройки', 
        language: 'Язык', generate_ai: '✨ Сгенерировать AI', find_online: '🌎 Найти в сети', random_image: '🎲 Случайное', 
        save: '💾 Сохранить', preview: '🔍 Предпросмотр', gallery: '📁 Галерея', upload_yours: '📥 Загрузить своё', 
        export: '📤 Экспорт', set_as_bg: '🏞️ Сделать фоном', delete: '🗑 Удалить', choose_theme: '🎨 Выбрать тему', 
        background: '🖼️ Фон', sorting: '🔀 Сортировка', changelog: '🏆 Зал Славы и Версии', 
        report_bug: '🐞 Сообщить о проблеме', suggest_idea: '💡 Предложить идею', clear_gallery: '🗑️ Очистить галерею', 
        themes: '🎨 Темы', backgrounds: '🖼️ Фоны', upload_your_bg: '📤 Загрузить свой фон', 
        reset_theme: 'Сбросить тему', reset_background: 'Сбросить фон', sort_newest: 'Сначала новые', 
        sort_oldest: 'Сначала старые', sort_random: 'Случайно', sort_favorites: '✅ Только избранное', 
        cat_waifu: 'Вайфу', cat_anime_gif: 'Аниме Гифки', cat_cyberpunk: 'Киберпанк', cat_nature: 'Природа', 
        cat_games: 'Игры', cat_dark_anime: 'Dark Anime', cat_supercars: 'Суперкары', 
        style_no_style: '-- Без стиля --', style_anime: 'Аниме / Вайфу', style_photorealistic: 'Фотореализм', 
        style_fantasy: 'Фэнтези Арт', style_cyberpunk_style: 'Киберпанк', style_digital_painting: 'Цифровой рисунок', 
        style_low_poly: '3D (Low Poly)', ctx_rename: 'Переименовать', ctx_copy_prompt: 'Копировать промпт', 
        prompt_placeholder: "Опиши свою идею здесь... (например, 'девушка с красными волосами')", 
        negative_prompt_placeholder: "❌ Негативный промпт (что НЕ нужно рисовать)", 
        bug_report_desc: "Пожалуйста, опишите проблему как можно подробнее. Что вы делали, когда она возникла?", 
        bug_report_placeholder: "Например: Когда я нажимаю 'Экспорт', ничего не происходит...", 
        suggestion_desc: "Есть идея, как сделать сервис лучше? Расскажите!", 
        suggestion_placeholder: "Например: Было бы круто добавить возможность менять размер картинки...", 
        send: "Отправить", select_all_label: 'Выбрать всё', select_ai_only_label: 'Выбрать только AI'
    }
};
