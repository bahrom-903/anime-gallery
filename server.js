// server.js - v6 (ROYAL PATCH)
import express from 'express';
import Replicate from 'replicate';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
app.use(express.static('.'));

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.post('/generate-image', async (req, res) => {
  try {
    const { prompt, negative_prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Промпт не может быть пустым.' });
    console.log(`Получен запрос на генерацию. Промпт: "${prompt}"`);
    const model = "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4";
    const input = { prompt, negative_prompt };
    const output = await replicate.run(model, { input });
    if (output && output.length > 0) {
      res.json({ imageUrl: output[0] });
    } else { throw new Error('Replicate API не вернул изображение.'); }
  } catch (error) {
    console.error('!!! ОШИБКА REPLICATE:', error.message);
    res.status(500).json({ error: 'Не удалось сгенерировать изображение. Возможно, закончились кредиты или сервис временно недоступен.' });
  }
});

app.post('/get-image-from-source', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL источника не указан.' });
    console.log(`Проксирование запроса на: ${url}`);
    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'AnimeGallery/1.0' } });
        if (!response.ok) throw new Error(`Статус ответа от ${url}: ${response.status}`);
        
        if (url.includes('waifu.im') || url.includes('waifu.pics')) {
            const data = await response.json();
            const imageUrl = data.url || (data.images && data.images[0] ? data.images[0].url : null);
            if (!imageUrl) throw new Error('API не вернул правильный ответ.');
            res.json({ imageUrl: imageUrl });
        } else {
            res.json({ imageUrl: response.url });
        }
    } catch (error) {
        console.error(`!!! ОШИБКА GET-IMAGE-FROM-SOURCE для ${url}:`, error.message);
        res.status(500).json({ error: 'Не удалось получить изображение из внешнего источника.' });
    }
});

app.post('/feedback', async (req, res) => {
    try {
        const { type, message } = req.body;
        if (!type || !message) return res.status(400).json({ error: 'Тип и сообщение обязательны.' });
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.error('!!! КРИТИЧЕСКАЯ ОШИБКА: Секреты TELEGRAM не найдены! Проверьте их имена в Secrets: TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID');
            return res.status(500).json({ error: 'Сервер не настроен для приема отзывов.' });
        }
        console.log('Секреты Telegram найдены. Попытка отправки...');
        const title = type === 'bug' ? '🐞 Новый баг-репорт' : '💡 Новое предложение';
        const text = `<b>${title}</b>\n\n<pre>${message}</pre>`;
        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const tgResponse = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
        });
        const responseData = await tgResponse.json();
        if (!responseData.ok) throw new Error(`Telegram API Error: ${responseData.description}`);
        res.status(200).json({ success: true, message: 'Отзыв успешно отправлен!' });
    } catch(error) {
        console.error('!!! ОШИБКА FEEDBACK:', error.message);
        res.status(500).json({ error: 'Ошибка на сервере при отправке отзыва.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Сервер запущен и слушает порт ${PORT}. Все готово к работе!`); });