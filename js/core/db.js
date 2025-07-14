/**
 * js/core/db.js
 * 
 * Модуль для работы с IndexedDB. Предоставляет простой и надежный
 * интерфейс для всех операций с базой данных (CRUD).
 * Абстрагирует сложность IndexedDB от остального приложения.
 */

import { DB_CONFIG } from '../state.js';

let db = null; // Храним открытое соединение с БД

/**
 * Открывает (или создает) и инициализирует базу данных.
 * Создает хранилища (object stores), если их не существует.
 * @returns {Promise<IDBDatabase>} Промис, который разрешается с объектом БД.
 */
function openDB() {
    return new Promise((resolve, reject) => {
        // Если соединение уже открыто, возвращаем его
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_CONFIG.NAME, DB_CONFIG.VERSION);

        request.onerror = (event) => {
            console.error('Ошибка открытия IndexedDB:', event.target.error);
            reject('Не удалось открыть IndexedDB.');
        };

        // Этот обработчик срабатывает только при создании новой БД или увеличении версии
        request.onupgradeneeded = (event) => {
            const tempDb = event.target.result;
            const stores = DB_CONFIG.STORES;

            if (!tempDb.objectStoreNames.contains(stores.SETTINGS)) {
                tempDb.createObjectStore(stores.SETTINGS);
            }
            if (!tempDb.objectStoreNames.contains(stores.GALLERY)) {
                const galleryStore = tempDb.createObjectStore(stores.GALLERY, { keyPath: 'id' });
                // Индекс для быстрой фильтрации по категории
                galleryStore.createIndex('category', 'category', { unique: false });
            }
            if (!tempDb.objectStoreNames.contains(stores.BACKGROUNDS)) {
                tempDb.createObjectStore(stores.BACKGROUNDS, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
    });
}

/**
 * Универсальная функция для выполнения транзакций.
 * @param {string} storeName Имя хранилища (из DB_CONFIG.STORES).
 * @param {'readonly' | 'readwrite'} type Тип транзакции.
 * @param {(store: IDBObjectStore) => IDBRequest} callback Функция, которая выполняет операцию с хранилищем.
 * @returns {Promise<any>} Промис с результатом операции.
 */
async function performTransaction(storeName, type, callback) {
    try {
        const currentDb = await openDB();
        const transaction = currentDb.transaction(storeName, type);
        const store = transaction.objectStore(storeName);
        const request = callback(store);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                console.error(`Ошибка транзакции (${storeName}):`, request.error);
                reject(`Ошибка транзакции (${storeName}): ${request.error}`);
            };
        });
    } catch (error) {
        console.error('Критическая ошибка транзакции:', error);
        throw error;
    }
}

// ===================================================================
//                 ПУБЛИЧНЫЕ МЕТОДЫ ДЛЯ РАБОТЫ С БД
// ===================================================================

/**
 * Получает одну запись по ключу.
 * @param {string} storeName Имя хранилища.
 * @param {any} key Ключ записи.
 * @returns {Promise<any>}
 */
export function get(storeName, key) {
    return performTransaction(storeName, 'readonly', store => store.get(key));
}

/**
 * Получает все записи из хранилища.
 * @param {string} storeName Имя хранилища.
 * @returns {Promise<any[]>}
 */
export function getAll(storeName) {
    return performTransaction(storeName, 'readonly', store => store.getAll());
}

/**
 * Добавляет или обновляет запись в хранилище.
 * @param {string} storeName Имя хранилища.
 * @param {any} value Значение для сохранения.
 * @returns {Promise<any>}
 */
export function put(storeName, value) {
    return performTransaction(storeName, 'readwrite', store => store.put(value));
}

/**
 * Удаляет запись по ключу.
 * @param {string} storeName Имя хранилища.
 * @param {any} key Ключ для удаления.
 * @returns {Promise<void>}
 */
export function remove(storeName, key) {
    return performTransaction(storeName, 'readwrite', store => store.delete(key));
}

/**
 * Очищает все хранилище.
 * @param {string} storeName Имя хранилища.
 * @returns {Promise<void>}
 */
export function clear(storeName) {
    return performTransaction(storeName, 'readwrite', store => store.clear());
}

/**
 * Получает записи по индексу (например, все картинки из одной категории).
 * @param {string} storeName Имя хранилища.
 * @param {string} indexName Имя индекса.
 * @param {any} query Значение для поиска по индексу.
 * @returns {Promise<any[]>}
 */
export function getByIndex(storeName, indexName, query) {
    return performTransaction(storeName, 'readonly', store => {
        const index = store.index(indexName);
        return index.getAll(query);
    });
}
