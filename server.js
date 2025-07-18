// =================================================================
//      ФАЙЛ: server.js
//      РОЛЬ: Бэкенд-сервер приложения
// =================================================================
import express from 'express';
import Replicate from 'replicate';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

// БЛОК 1: КОНФИГУРАЦИЯ И ИНИЦИАЛИЗАЦИЯ
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Эта команда говорит серверу, чтобы он отдавал статические файлы (html, css, js)
// из корневой папки проекта.
app.use(express.static(path.join(__dirname, '..')));

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const PORT = process.env.PORT || 3000;

if (!REPLICATE_API_TOKEN) {
    console.warn("!!! ВНИМАНИЕ: Переменная окружения REPLICATE_API_TOKEN не установлена. AI-генерация не будет работать.");
}

const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });

const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'
};

const PROMPT_BRAIN = {
    waifu: { positive: 'anime artwork, anime style, key visual, vibrant, studio quality, masterpiece, best quality,', negative: 'photo, realistic, 3d, render, photography, real life, text, watermark, low quality, worst quality, blurry' },
    anime_gif: { positive: 'anime artwork, anime style, key visual, vibrant, studio quality, masterpiece, best quality,', negative: 'photo, realistic, 3d, render, photography, real life, text, watermark, low quality, worst quality, blurry' },
    cyberpunk: { positive: 'cyberpunk art, neon lights, futuristic city, cinematic, detailed, atmospheric, high-tech, masterpiece,', negative: 'drawing, painting, anime, nature, day, bright, cartoon' },
    nature: { positive: 'landscape photography, national geographic, 4k, photorealistic, stunning, beautiful, detailed, masterpiece,', negative: 'drawing, painting, anime, people, text, watermark, ugly' },
    games: { positive: 'video game art, fan art, splash screen, concept art, cinematic, detailed character, epic, masterpiece,', negative: 'photo, real life, screenshot, text, watermark, blurry, low quality' },
    dark_anime: { positive: 'dark fantasy art, gothic, horror, monster, intricate details, moody, atmospheric, masterpiece,', negative: 'photo, realistic, cute, bright, day, happy, text, watermark' },
    supercars: { positive: 'car photography, cinematic shot, photorealistic, hyper detailed, professional, studio lighting, 8k, masterpiece,', negative: 'drawing, anime, painting, cartoon, ugly, text, watermark, people' },
    default: { positive: 'masterpiece, best quality, high quality, detailed,', negative: 'low quality, worst quality, blurry, text, watermark, signature' }
};

// БЛОК 2: СИСТЕМА КЕШИРОВАНИЯ
const serverCache = new Map();
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 минут

// БЛОК 3: ЭНДПОИНТЫ API
app.post('/generate-image', async (req, res) => {
    try {
        if (!REPLICATE_API_TOKEN) throw new Error("Ключ API для Replicate не настроен на сервере.");
        const { prompt: userPrompt, negative_prompt: userNegativePrompt, category } = req.body;
        if (!userPrompt) return res.status(400).json({ error: 'Промпт не может быть пустым.' });
        const brain = PROMPT_BRAIN[category] || PROMPT_BRAIN.default;
        const finalPositivePrompt = `${brain.positive} ${userPrompt}`;
        const finalNegativePrompt = `${brain.negative}, ${userNegativePrompt || ''}`;
        const model = "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4";
        console.log(`-> GENERATE: Категория: "${category}"`);
        const input = { prompt: finalPositivePrompt, negative_prompt: finalNegativePrompt };
        const output = await replicate.run(model, { input });
        if (output && output.length > 0) {
            res.json({ imageUrl: output[0], isAiGenerated: true });
        } else { throw new Error('Replicate API не вернул изображение.'); }
    } catch (error) {
        console.error('!!! ОШИБКА REPLICATE:', error.message);
        res.status(500).json({ error: 'Не удалось сгенерировать изображение. Возможно, модель временно недоступна.' });
    }
});

app.post('/get-image-from-source', async (req, res) => {
    const { url, category } = req.body;
    if (!url || !category) return res.status(400).json({ error: 'URL источника или категория не указаны.' });
    const cacheKey = `random_image_${category}`;
    const cachedItem = serverCache.get(cacheKey);
    if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_DURATION_MS) {
        console.log(`-> GET-IMAGE: Отдаем из кеша для категории "${category}"`);
        return res.json({ imageUrl: cachedItem.imageUrl });
    }
    console.log(`-> GET-IMAGE: Проксирование запроса на: ${url}`);
    try {
        const response = await fetch(url, { headers: BROWSER_HEADERS });
        if (!response.ok) throw new Error(`Внешний сервис недоступен (статус: ${response.status})`);
        let imageUrl;
        if (url.includes('waifu.im') || url.includes('waifu.pics')) {
            const data = await response.json();
            imageUrl = (data.images && data.images[0] ? data.images[0].url : null) || data.url;
            if (!imageUrl) throw new Error('API не вернул правильный формат ответа.');
        } else { imageUrl = response.url; }
        serverCache.set(cacheKey, { imageUrl, timestamp: Date.now() });
        console.log(`-> GET-IMAGE: Сохранили в кеш для категории "${category}"`);
        res.json({ imageUrl });
    } catch (error) {
        console.error(`!!! КРИТИЧЕСКАЯ ОШИБКА GET-IMAGE-FROM-SOURCE для ${url}:`, error.message);
        res.status(500).json({ error: 'Не удалось получить изображение.' }); 
    }
});

app.post('/feedback', async (req, res) => {
    try {
        const { type, message } = req.body;
        if (!type || !message) { return res.status(400).json({ error: 'Тип и сообщение обязательны.' }); }
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.error('!!! КРИТИЧЕСКАЯ ОШИБКА: Переменные окружения TELEGRAM не найдены!');
            return res.status(500).json({ error: 'Сервер не настроен для приема отзывов.' });
        }
        console.log(`-> FEEDBACK: Получен отзыв типа "${type}". Отправка в Telegram...`);
        const title = type === 'bug' ? '🐞 Новый баг-репорт' : '💡 Новое предложение';
        const text = `<b>${title}</b>\n\n<pre>${message}</pre>`;
        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const tgResponse = await fetch(telegramApiUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
        });
        const responseData = await tgResponse.json();
        if (!responseData.ok) { throw new Error(`Telegram API Error: ${responseData.description}`); }
        console.log('-> FEEDBACK: Сообщение успешно отправлено в Telegram.');
        res.status(200).json({ success: true, message: 'Отзыв успешно отправлен!' });
    } catch(error) {
        console.error('!!! ОШИБКА ВНУТРИ /feedback:', error.message);
        res.status(500).json({ error: 'Критическая ошибка на сервере при отправке отзыва.' });
    }
});

// БЛОК 4: ЗАПУСК СЕРВЕРА
app.listen(PORT, () => { console.log(`Сервер запущен и слушает порт ${PORT}. Все готово к работе!`); });
