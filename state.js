// ===================================
//      Файл: state.js
// ===================================

// Это объект, где будет храниться вся "память" приложения
const state = {
    currentSort: 'date_desc',
    isFavFilterActive: false,
    currentCategory: 'waifu',
    currentLanguage: 'ru',
    contextedItemId: null,
    lastAiResult: null,
};

// Мы экспортируем не сам объект, а функцию, чтобы никто случайно не изменил его напрямую
export const getState = () => state;

// И функции для безопасного изменения состояния
export const setState = (key, value) => {
    if (key in state) {
        state[key] = value;
    } else {
        console.error(`Попытка установить несуществующее состояние: ${key}`);
    }
};
