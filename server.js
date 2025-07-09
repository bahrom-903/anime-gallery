// =================================================================
//          👇 КОПИРУЙ ВЕСЬ КОД НИЖЕ ДЛЯ ФАЙЛА server.js 👇
// =================================================================

import express from 'express';
import Replicate from 'replicate';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
app.use(express.static('.'));

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'
};

// ====================================================================
//           ⭐ СИСТЕМА "СЕКРЕТНЫХ ПРОМПТОВ" ДЛЯ КАТЕГОРИЙ ⭐
// ====================================================================
const CATEGORY_PROMPTS = {
    'waifu': {
        model: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
        prepend_prompt: 'anime artwork, anime style, high quality, 1girl, solo,',
        append_prompt: 'masterpiece, best quality, ultra-detailed, beautiful detailed eyes,',
        negative_prompt: 'photo, realistic, 3d, (deformed), (bad anatomy), (bad proportions), (blurry), watermark, text,'
    },
    'anime_gif': {
        model: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
        prepend_prompt: 'anime artwork, anime style, high quality, 1girl, solo,',
        append_prompt: 'masterpiece, best quality, ultra-detailed, beautiful detailed eyes,',
        negative_prompt: 'photo, realistic, 3d, (deformed), (bad anatomy), (bad proportions), (blurry), watermark, text,'
    },
    'cyberpunk': {
        model: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
        prepend_prompt: 'cyberpunk style, concept art, futuristic, neon lights,',
        append_prompt: 'dramatic lighting, intricate details, 4k,',
        negative_prompt: 'person, people, man, woman, cartoon, drawing, painting, (deformed), (blurry),'
    },
    'nature': {
        model: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
        prepend_prompt: 'beautiful landscape painting,',
        append_prompt: 'epic, breathtaking, 4k, trending on artstation,',
        negative_prompt: 'person, people, man, woman, building, road, (blurry), (ugly),'
    },
    'default': {
        model: 'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
        prepend_prompt: '',
        append_prompt: '4k, high quality, masterpiece,',
        negative_prompt: '(blurry), (ugly), low quality,'
    }
};

app.post('/generate-image', async (req, res) => {
    try {
        const { prompt: user_prompt, negative_prompt: user_negative_prompt, category } = req.body;
        if (!user_prompt) return res.status(400).json({ error: 'Промпт не может быть пустым.' });

        // Выбираем "секретный" набор промптов для категории или набор по умолчанию
        const presets = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS['default'];

        // Собираем финальный промпт: (секрет_начало) + (промпт_пользователя) + (секрет_конец)
        const finalPrompt = `${presets.prepend_prompt} ${user_prompt}, ${presets.append_prompt}`;
        // Собираем финальный негативный промпт: (секретный_негатив) + (негатив_пользователя)
        const finalNegativePrompt = `${presets.negative_prompt}, ${user_negative_prompt || ''}`;
        
        console.log(`-> GENERATE: Категория: "${category}", Модель: "${presets.model}"`);
        console.log(`-> PROMPT: "${finalPrompt}" | NEGATIVE: "${finalNegativePrompt}"`);

        const input = {
            prompt: finalPrompt,
            negative_prompt: finalNegativePrompt,
        };
        
        const output = await replicate.run(presets.model, { input });

        if (output && output.length > 0) {
            res.json({ imageUrl: output[0] });
        } else { 
            throw new Error('Replicate API не вернул изображение.'); 
        }
    } catch (error) {
        console.error('!!! ОШИБКА REPLICATE:', error);
        res.status(500).json({ error: 'Не удалось сгенерировать изображение. Возможно, модель временно недоступна.' });
    }
});

// Остальной код остается без изменений...
app.post('/get-image-from-source', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL источника не указан.' });
    try {
        const response = await fetch(url, { headers: BROWSER_HEADERS });
        if (!response.ok) throw new Error(`Внешний сервис недоступен (статус: ${response.status})`);
        
        if (url.includes('waifu.im')) {
            const data = await response.json();
            const imageUrl = data.images && data.images[0] ? data.images[0].url : null;
            if (!imageUrl) throw new Error('API не вернул правильный формат ответа.');
            res.json({ imageUrl: imageUrl });
        } else {
            res.json({ imageUrl: response.url });
        }
    } catch (error) {
        console.error(`!!! КРИТИЧЕСКАЯ ОШИБКА GET-IMAGE-FROM-SOURCE для ${url}:`, error.message);
        res.status(500).json({ error: 'Не удалось получить изображение.' }); 
    }
});

app.post('/feedback', async (req, res) => {
    try {
        const { type, message } = req.body;
        if (!type || !message) return res.status(400).json({ error: 'Тип и сообщение обязательны.' });

        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
        
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.error('!!! КРИТИЧЕСКАЯ ОШИБКА: Переменные окружения TELEGRAM не найдены!');
            return res.status(500).json({ error: 'Сервер не настроен для приема отзывов.' });
        }
        
        const title = type === 'bug' ? '🐞 Новый баг-репорт' : '💡 Новое предложение';
        const text = `<b>${title}</b>\n\n<pre>${message}</pre>`;
        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const tgResponse = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'User-Agent': BROWSER_HEADERS['User-Agent'] },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
        });
        
        const responseData = await tgResponse.json();
        if (!responseData.ok) {
            console.error(`!!! ОШИБКА TELEGRAM API: ${responseData.description}`);
            throw new Error(`Telegram API Error: ${responseData.description}`);
        }
        
        res.status(200).json({ success: true, message: 'Отзыв успешно отправлен!' });
    } catch(error) {
        console.error('!!! ОШИБКА ВНУТРИ /feedback:', error.message);
        res.status(500).json({ error: 'Критическая ошибка на сервере при отправке отзыва.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Сервер запущен и слушает порт ${PORT}. Все готово к работе!`); });
