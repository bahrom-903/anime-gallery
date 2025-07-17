import express from 'express';
import Replicate from 'replicate';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
app.use(express.static('.'));

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const PORT = process.env.PORT || 3000;

if (!REPLICATE_API_TOKEN) {
    console.warn("!!! ВНИМАНИЕ: REPLICATE_API_TOKEN не установлен. AI-генерация не будет работать.");
}
const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });

const BROWSER_HEADERS = { /* ... без изменений ... */ };
const PROMPT_BRAIN = { /* ... без изменений ... */ };

// ⭐⭐ СИСТЕМА КЕШИРОВАНИЯ НА СТОРОНЕ СЕРВЕРА ⭐⭐
const serverCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 минут в миллисекундах

app.post('/generate-image', async (req, res) => { /* ... без изменений ... */ });

app.post('/get-image-from-source', async (req, res) => {
    const { url, category } = req.body;
    if (!url) return res.status(400).json({ error: 'URL источника не указан.' });

    const cacheKey = category || url; // Используем категорию как ключ кеша
    const cachedItem = serverCache.get(cacheKey);

    // Если есть валидный кеш, отдаем его
    if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_TTL)) {
        console.log(`-> GET-IMAGE: Отдаем из кеша для категории "${cacheKey}"`);
        return res.json({ imageUrl: cachedItem.imageUrl });
    }
    
    console.log(`-> GET-IMAGE: Запрос на ${url} для категории "${cacheKey}"`);
    try {
        const response = await fetch(url, { headers: BROWSER_HEADERS });
        if (!response.ok) throw new Error(`Внешний сервис недоступен (статус: ${response.status})`);
        
        let imageUrl;
        if (url.includes('waifu.im') || url.includes('waifu.pics')) {
            const data = await response.json();
            imageUrl = data.images?.[0]?.url || data.url;
            if (!imageUrl) throw new Error('API не вернул правильный формат ответа.');
        } else {
            imageUrl = response.url;
        }

        // Сохраняем результат в кеш
        serverCache.set(cacheKey, { imageUrl, timestamp: Date.now() });
        console.log(`-> GET-IMAGE: Сохранено в кеш для категории "${cacheKey}"`);
        
        res.json({ imageUrl });

    } catch (error) {
        console.error(`!!! КРИТИЧЕСКАЯ ОШИБКА GET-IMAGE для ${url}:`, error.message);
        res.status(500).json({ error: 'Не удалось получить изображение.' }); 
    }
});

app.post('/feedback', async (req, res) => { /* ... без изменений ... */ });

app.listen(PORT, () => { console.log(`Сервер запущен и слушает порт ${PORT}. Все готово к работе!`); });
