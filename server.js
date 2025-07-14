/**
 * server.js (Синхронизация v2.0)
 * 
 * Улучшенная версия с правильной обработкой порта для Render
 * и маршрутом для проверки состояния сервера.
 */

import express from 'express';
import Replicate from 'replicate';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
// Указываем Express, что все статические файлы (html, css, js) лежат в корневой папке.
// Это позволяет index.html корректно загружать style.css и js/main.js
app.use(express.static('.')); 

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'
};

const PROMPT_BRAIN = {
    // ... Ваш PROMPT_BRAIN без изменений ...
    waifu: {
        positive: 'anime artwork, anime style, key visual, vibrant, studio quality, masterpiece, best quality,',
        negative: 'photo, realistic, 3d, render, photography, real life, text, watermark, low quality, worst quality, blurry'
    },
    // ... и остальные категории ...
};

// ====================================================================
//                         МАРШРУТЫ API
// ====================================================================

// НОВЫЙ МАРШРУТ: Проверка состояния сервера
// Если мы сможем открыть https://anime-gallery-xcnh.onrender.com/health, 
// это будет значить, что сервер точно жив.
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.post('/generate-image', async (req, res) => {
    // ... Ваш код для /generate-image без изменений ...
});

app.post('/get-image-from-source', async (req, res) => {
    // ... Ваш код для /get-image-from-source без изменений ...
});

app.post('/feedback', async (req, res) => {
    // ... Ваш код для /feedback без изменений ...
});

// ====================================================================
//                   ЗАПУСК СЕРВЕРА (КЛЮЧЕВОЕ ИЗМЕНЕНИЕ)
// ====================================================================

// Render предоставляет порт в переменной окружения PORT.
// Если ее нет (при локальном запуске), используем 3000.
// Это стандартный и самый надежный способ для Render.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    // Теперь в лог выводится правильный, динамический порт.
    console.log(`Сервер запущен и слушает порт ${PORT}. Все готово к работе!`);
});
