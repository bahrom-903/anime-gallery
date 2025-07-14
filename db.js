// ===================================
//      Файл: db.js
// ===================================
import { DB_NAME, DB_VERSION } from './config.js';

/**
 * Открывает соединение с базой данных IndexedDB.
 * @returns {Promise<IDBDatabase>} Промис, который разрешается объектом базы данных.
 */
const openDb = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error("Не удалось открыть IndexedDB.");
            reject("Не удалось открыть IndexedDB.");
        };

        request.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings');
            }
            if (!db.objectStoreNames.contains('gallery')) {
                const galleryStore = db.createObjectStore('gallery', { keyPath: 'id' });
                galleryStore.createIndex('category', 'category', { unique: false });
            }
            if (!db.objectStoreNames.contains('defaultBackgrounds')) {
                db.createObjectStore('defaultBackgrounds', { keyPath: 'id' });
            }
        };

        request.onsuccess = e => {
            resolve(e.target.result);
        };
    });
};

/**
 * Универсальная функция для выполнения запросов к IndexedDB.
 * @param {string} storeName - Имя хранилища.
 * @param {'readonly' | 'readwrite'} mode - Режим транзакции.
 * @param {(store: IDBObjectStore) => IDBRequest} callback - Функция, получающая хранилище и возвращающая запрос.
 * @returns {Promise<any>} Промис с результатом запроса.
 */
export const dbRequest = async (storeName, mode, callback) => {
    try {
        const db = await openDb();
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const request = callback(store);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                console.error(`Ошибка транзакции (${storeName}):`, request.error);
                reject(`Ошибка транзакции (${storeName}): ${request.error}`);
            };
        });
    } catch (e) {
        console.error("Критическая ошибка DB:", e);
        throw e; // Пробрасываем ошибку дальше
    }
};
