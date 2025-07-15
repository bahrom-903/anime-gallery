// =================================================================
//          СЕРВЕР. ⭐ ФИНАЛЬНАЯ УЛУЧШЕННАЯ ВЕРСИЯ ⭐
// =================================================================

import express from 'express';
import Replicate from 'replicate';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
app.use(express.static('.')); // Обслуживаем статику из корневой папки

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'
};

// ====================================================================
//           ⭐ МОЗГ ГЕНЕРАТОРА: КАРТА СКРЫТЫХ ПРОМПТОВ ⭐
// Это реализация твоей идеи "супер-промптов". Теперь для каждой
// категории к запросу пользователя добавляются эти "усилители".
// ====================================================================
const PROMPT_BRAIN = {
    waifu: {
        positive: 'anime artwork, anime style, key visual, vibrant, studio quality, masterpiece, best quality,',
        negative: 'photo, realistic, 3d, render, photography, real life, text, watermark, low quality, worst quality, blurry, morbid, signature, ugly'
    },
    anime_gif: {
        positive: 'anime artwork, anime style, key visual, vibrant, studio quality, masterpiece, best quality,',
        negative: 'photo, realistic, 3d, render, photography, real life, text, watermark, low quality, worst quality, blurry'
    },
    cyberpunk: {
        positive: 'cyberpunk art, neon lights, futuristic city, cinematic, detailed, atmospheric, high-tech, masterpiece,',
        negative: 'drawing, painting, anime, nature, day, bright, cartoon, text, watermark'
    },
    nature: {
        positive: 'landscape photography, national geographic, 4k, photorealistic, stunning, beautiful, detailed, masterpiece,',
        negative: 'drawing, painting, anime, people, text, watermark, ugly'
    },
    games: {
        positive: 'video game art, fan art, splash screen, concept art, cinematic, detailed character, epic, masterpiece,',
        negative: 'photo, real life, screenshot, text, watermark, blurry, low quality'
    },
    dark_anime: {
        positive: 'dark fantasy art, gothic, horror, monster, intricate details, moody, atmospheric, masterpiece,',
        negative: 'photo, realistic, cute, bright, day, happy, text, watermark'
    },
    supercars: {
        positive: 'car photography, cinematic shot, photorealistic, hyper detailed, professional, studio lighting, 8k, masterpiece,',
        negative: 'drawing, anime, painting, cartoon, ugly, text, watermark, people'
    },
    default: {
        positive: 'masterpiece, best quality, high quality, detailed,',
        negative: 'low quality, worst quality, blurry, text, watermark, signature'
    }
};

app.post('/generate-image', async (req, res) => {
    try {
        const { prompt: userPrompt, negative_prompt: userNegativePrompt, category } = req.body;
        if (!userPrompt) return res.status(400).json({ error: 'Промпт не может быть пустым.' });

        // ⭐ Выбираем "мозг" для текущей категории или "мозг" по умолчанию
        const brain = PROMPT_BRAIN[category] || PROMPT_BRAIN.default;

        // ⭐ Собираем финальный промпт: сначала скрытый, потом пользовательский
        const finalPositivePrompt = `${brain.positive} ${userPrompt}`;
        
        // ⭐ Собираем финальный негативный промпт: сначала скрытый, потом пользовательский
        const finalNegativePrompt = `${brain.negative}, ${userNegativePrompt || ''}`;

        const model = "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4";
        
        console.log(`-> GENERATE: Категория: "${category}", Модель: "Stable Diffusion"`);
        console.log(`-> FINAL PROMPT: ${finalPositivePrompt}`);
        console.log(`-> FINAL NEGATIVE: ${finalNegativePrompt}`);

        const input = {
            prompt: finalPositivePrompt,
            negative_prompt: finalNegativePrompt,
        };
        
        const output = await replicate.run(model, { input });

        if (output && output.length > 0) {
            // Возвращаем картинку и флаг, что она от AI
            res.json({ imageUrl: output[0], isAiGenerated: true });
        } else { 
            throw new Error('Replicate API не вернул изображение.'); 
        }
    } catch (error) {
        console.error('!!! ОШИБКА REPLICATE:', error.message);
        res.status(500).json({ error: 'Не удалось сгенерировать изображение. Возможно, закончились кредиты или модель недоступна.' });
    }
});


app.post('/get-image-from-source', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL источника не указан.' });
    console.log(`-> GET-IMAGE: Проксирование запроса на: ${url}`);
    try {
        const response = await fetch(url, { headers: BROWSER_HEADERS });
        if (!response.ok) {
            throw new Error(`Внешний сервис недоступен (статус: ${response.status})`);
        }
        
        // API waifu.im/pics возвращают JSON, остальные - редирект на картинку
        if (url.includes('waifu.im') || url.includes('waifu.pics')) {
            const data = await response.json();
            // Обрабатываем разные форматы ответа
            let imageUrl = (data.images && data.images[0]) ? data.images[0].url : data.url;

            if (!imageUrl) {
                throw new Error('API не вернул правильный формат ответа.');
            }
            res.json({ imageUrl: imageUrl, isAiGenerated: false }); // ⭐ Добавлен флаг isAiGenerated
        } else {
            // Для unsplash и других, URL картинки находится в ответе
            res.json({ imageUrl: response.url, isAiGenerated: false }); // ⭐ Добавлен флаг isAiGenerated
        }
    } catch (error) {
        console.error(`!!! КРИТИЧЕСКАЯ ОШИБКА GET-IMAGE-FROM-SOURCE для ${url}:`, error.message);
        res.status(500).json({ error: 'Не удалось получить изображение.' }); 
    }
});


app.post('/feedback', async (req, res) => {
    try {
        const { type, message } = req.body;
        if (!type || !message) {
            return res.status(400).json({ error: 'Тип и сообщение обязательны.' });
        }

        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
        
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.error('!!! КРИТИЧЕСКАЯ ОШИБКА: Переменные окружения TELEGRAM не найдены!');
            // Для пользователя вернем ошибку, что функция временно недоступна
            return res.status(500).json({ error: 'Сервис отзывов временно не работает.' });
        }
        
        console.log(`-> FEEDBACK: Получен отзыв типа "${type}". Отправка в Telegram...`);
        const title = type === 'bug' ? '🐞 Новый баг-репорт' : '💡 Новое предложение';
        const text = `<b>${title}</b>\n\n<pre>${message.replace(/</g, "<").replace(/>/g, ">")}</pre>`; // Экранируем HTML в сообщении
        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const tgResponse = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
        });
        
        const responseData = await tgResponse.json();
        if (!responseData.ok) {
            console.error(`!!! ОШИБКА TELEGRAM API: ${responseData.description}`);
            throw new Error('Не удалось связаться с Telegram.');
        }
        
        console.log('-> FEEDBACK: Сообщение успешно отправлено в Telegram.');
        res.status(200).json({ success: true, message: 'Отзыв успешно отправлен!' });
    } catch(error) {
        console.error('!!! ОШИБКА ВНУТРИ /feedback:', error.message);
        res.status(500).json({ error: 'Критическая ошибка на сервере при отправке отзыва.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`✅ Сервер запущен и слушает порт ${PORT}. Все готово к работе!`); });
