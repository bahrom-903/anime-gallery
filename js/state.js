/**
 * js/state.js
 * 
 * Мозг приложения. Хранит глобальное состояние и основные конфигурационные
 * данные. Предоставляет функции для безопасного изменения состояния.
 */

// ===================================================================
//                        ГЛОБАЛЬНОЕ СОСТОЯНИЕ
// ===================================================================

// `reactive` - это наш основной объект состояния.
// Все данные, которые могут меняться в ходе работы приложения, хранятся здесь.
export const reactive = {
    // Состояние пользователя (null, если не авторизован)
    user: null, // { id, email, credits }

    // Состояние генератора
    lastAiResult: null, // { imageUrl, prompt, isAiGenerated }
    isGenerating: false,

    // Состояние галереи
    currentCategory: 'waifu',
    currentSort: 'date_desc',
    isFavFilterActive: false,
    contextedItemId: null, // ID элемента галереи для контекстного меню

    // Глобальное состояние UI
    currentLanguage: 'ru',
    activePanel: null, // ID активной панели
};

// Функция для безопасного обновления состояния.
// Позволяет обновлять только часть состояния, не затрагивая остальное.
// Пример: updateState({ currentCategory: 'cyberpunk' });
export function updateState(newState) {
    Object.assign(reactive, newState);
}


// ===================================================================
//                      КОНСТАНТЫ И КОНФИГУРАЦИЯ
// ===================================================================

// --- Константы для IndexedDB ---
export const DB_CONFIG = {
    NAME: 'AnimeGalleryDB_V23_Modular',
    VERSION: 1,
    STORES: {
        SETTINGS: 'settings',
        GALLERY: 'gallery',
        BACKGROUNDS: 'defaultBackgrounds',
    }
};

// --- Конфигурация категорий ---
// Источники для поиска изображений в сети.
export const CATEGORIES = {
    waifu: { 
        sources: { 
            random: 'https://api.waifu.im/search/?included_tags=waifu', 
            search: 'https://api.waifu.im/search/?included_tags=waifu' 
        } 
    },
    // ... другие категории из вашего старого client.js
    // Я добавлю несколько для примера. Вам нужно будет перенести сюда все остальные.
    cyberpunk: { 
        sources: { 
            random: 'https://source.unsplash.com/1600x900/?cyberpunk', 
            search: 'https://source.unsplash.com/1600x900/?cyberpunk,neon' 
        } 
    },
    nature: { 
        sources: { 
            random: 'https://source.unsplash.com/1600x900/?nature', 
            search: 'https://source.unsplash.com/1600x900/?landscape,nature' 
        } 
    },
};

// --- Стили для генератора ---
export const AI_STYLES = {
    'no_style': '',
    'anime': ', anime style, waifu',
    'photorealistic': ', photorealistic, 4k, ultra detailed',
    'fantasy': ', fantasy art, intricate details, epic scene',
    'cyberpunk_style': ', cyberpunk style, neon lights',
    'digital_painting': ', digital painting, concept art',
    'low_poly': ', low poly, isometric'
};

// --- Темы оформления ---
export const THEMES = [
    { id: "dark" }, { id: "light" }, { id: "gray" }, { id: "retro" }, 
    { id: "dracula" }, { id: "nord" }, { id: "solarized" }, { id: "gruvbox" },
    { id: "monokai" }, { id: "tomorrow_night" }, { id: "one_dark" }, 
    { id: "cyberpunk" }, { id: "matrix" }, { id: "crimson" }, { id: "synthwave" }
];

// --- Фоны по умолчанию ---
// Пути к фонам, которые хранятся в папке /backgrounds
export const DEFAULT_BACKGROUNDS = [
    { name: 'cyberpunk', url: './backgrounds/cyberpunk.jpg'},
    { name: 'night-tokyo', url: './backgrounds/night-tokyo.jpg'},
    // ... Перенесите сюда остальные фоны из вашего старого client.js
];

// --- "Мозг" для случайных промптов ---
// Генерирует осмысленные промпты для разных категорий
export const RANDOM_PROMPT_BRAIN = {
    waifu: { 
        subject: ["1girl, school uniform", "elf girl with long hair", "cat girl with blue eyes"],
        details: ["cherry blossom background", "looking at viewer", "holding a book"],
        style: ["by makoto shinkai", "in the style of ghibli", "90s anime style"]
    },
    cyberpunk: { 
        subject: ["a cyborg in a neon city", "a hacker at a terminal", "a futuristic flying car"],
        details: ["rainy night", "holographic advertisements", "dystopian atmosphere"],
        style: ["cinematic", "blade runner style", "by syd mead"]
    },
    // ... Перенесите сюда остальные "мозги"
    default: {
        subject: ["a fantasy castle", "a portrait of a knight", "a space battle"],
        details: ["epic lighting", "intricate details", "dynamic pose"],
        style: ["digital painting", "concept art", "by greg rutkowski"]
    }
};
