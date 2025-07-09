// --- НАЧАЛО ФАЙЛА server.js (СУПЕР-ИСПРАВЛЕНИЕ) ---

import express from 'express';
import Replicate from 'replicate';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
app.use(express.static('.'));

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// *** ИСПРАВЛЕНИЕ #1: Заголовки, которые притворяются браузером ***
const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
};

// server.js
// 👇 ЗАМЕНИ ВСЮ ФУНКЦИЮ ЦЕЛИКОМ НА ЭТОТ КОД 👇
app.post('/generate-image', async (req, res) => {
    try {
        // Получаем категорию из запроса
        const { prompt, negative_prompt, category } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Промпт не может быть пустым.' });

        let finalPrompt = prompt;

        // Наша новая логика проверки обязательных слов
        const mandatoryKeywords = {
            waifu: ['girl', 'woman', 'waifu', 'female'],
            supercars: ['car', 'supercar', 'sportscar', 'automobile']
            // Можно добавить другие категории, например: 'nature': ['landscape', 'nature', 'tree']
        };

        if (category && mandatoryKeywords[category]) {
            const keywords = mandatoryKeywords[category];
            // Проверяем, есть ли в промпте хоть одно из обязательных слов
            const hasKeyword = keywords.some(keyword => prompt.toLowerCase().includes(keyword));
            
            if (!hasKeyword) {
                // Если ни одного ключевого слова нет, добавляем первое из списка в начало промпта
                finalPrompt = `${keywords[0]}, ${prompt}`;
                console.log(`-> PROMPT-FIX: Добавлено слово "${keywords[0]}" для категории "${category}"`);
            }
        }
        
        console.log(`-> GENERATE: Промпт: "${finalPrompt}"`);
        const model = "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4";
        // Используем доработанный промпт
        const input = { prompt: finalPrompt, negative_prompt };
        const output = await replicate.run(model, { input });
        
        if (output && output.length > 0) {
            res.json({ imageUrl: output[0] });
        } else { throw new Error('Replicate API не вернул изображение.'); }
    } catch (error) {
        console.error('!!! ОШИБКА REPLICATE:', error.message);
        res.status(500).json({ error: 'Не удалось сгенерировать изображение. Возможно, закончились кредиты.' });
    }
});

// server.js
// 👇 КОПИРУЙ ВСЁ ОТСЮДА И ЗАМЕНЯЙ СВОЙ БЛОК 👇
app.post('/get-image-from-source', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL источника не указан.' });
    console.log(`-> GET-IMAGE: Проксирование запроса на: ${url}`);
    try {
        const response = await fetch(url, { headers: BROWSER_HEADERS });
        if (!response.ok) {
            console.error(`!!! ОШИБКА GET-IMAGE: Статус ответа от ${url}: ${response.status}`);
            throw new Error(`Внешний сервис недоступен (статус: ${response.status})`);
        }
        
        if (url.includes('waifu.im') || url.includes('waifu.pics')) {
            const data = await response.json();
            let imageUrl = data.images && data.images[0] ? data.images[0].url : null;
            if (!imageUrl) { imageUrl = data.url; }

            if (!imageUrl) {
                console.error('!!! ОШИБКА API: Не найден URL изображения в ответе от', url, 'Ответ:', JSON.stringify(data));
                throw new Error('API не вернул правильный формат ответа.');
            }
            
            console.log(`-> API-OK: Найден URL: ${imageUrl}`);
            res.json({ imageUrl: imageUrl });

        } else {
            console.log(`-> DIRECT-LINK-OK: Прямая ссылка: ${response.url}`);
            res.json({ imageUrl: response.url });
        }
    } catch (error) {
        console.error(`!!! КРИТИЧЕСКАЯ ОШИБКА GET-IMAGE-FROM-SOURCE для ${url}:`, error.message);
        // 👇 ВОТ ТВОЕ ИСПРАВЛЕНИЕ В ДЕЙСТВИИ! 👇
        res.status(500).json({ error: 'Не удалось получить изображение.' }); 
    }
});
// 👆 И ДОСЮДА 👆
app.post('/feedback', async (req, res) => {
    try {
        const { type, message } = req.body;
        if (!type || !message) {
            console.log('-> FEEDBACK: Получен неполный запрос.');
            return res.status(400).json({ error: 'Тип и сообщение обязательны.' });
        }
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.error('!!! КРИТИЧЕСКАЯ ОШИБКА: Секреты TELEGRAM не найдены!');
            return res.status(500).json({ error: 'Сервер не настроен для приема отзывов.' });
        }
        
        console.log(`-> FEEDBACK: Попытка отправки в Telegram... Тип: ${type}`);
        const title = type === 'bug' ? '🐞 Новый баг-репорт' : '💡 Новое предложение';
        const text = `<b>${title}</b>\n\n<pre>${message}</pre>`;
        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const tgResponse = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // *** ИСПРАВЛЕНИЕ #3: Используем User-Agent и для телеграма ***
                'User-Agent': BROWSER_HEADERS['User-Agent']
            },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
        });
        
        console.log(`-> TELEGRAM API STATUS: ${tgResponse.status}`);
        const responseData = await tgResponse.json();

        if (!responseData.ok) {
            console.error(`!!! ОШИБКА TELEGRAM API: ${responseData.description}`, responseData);
            throw new Error(`Telegram API Error: ${responseData.description}`);
        }
        
        console.log('-> FEEDBACK: Сообщение успешно отправлено в Telegram.');
        res.status(200).json({ success: true, message: 'Отзыв успешно отправлен!' });
    } catch(error) {
        console.error('!!! ОШИБКА ВНУТРИ /feedback:', error.message);
        res.status(500).json({ error: 'Критическая ошибка на сервере при отправке отзыва.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Сервер запущен и слушает порт ${PORT}. Все готово к работе!`); });

// --- КОНЕЦ ФАЙЛА server.js ---
