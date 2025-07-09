// --- НАЧАЛО ФАЙЛА server.js (СУПЕР-АПГРЕЙД) ---

import express from 'express';
import Replicate from 'replicate';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());
app.use(express.static('.'));

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
};

app.post('/generate-image', async (req, res) => {
  try {
    const { prompt, negative_prompt, model, width, height, num_outputs } = req.body;
    
    if (!prompt) return res.status(400).json({ error: 'Промпт не может быть пустым.' });
    if (!model) return res.status(400).json({ error: 'AI Модель не выбрана.' });

    console.log(`-> GENERATE: Запрос на модель ${model}`);
    
    const input = {
      prompt,
      negative_prompt,
      width: parseInt(width, 10),
      height: parseInt(height, 10),
      num_outputs: parseInt(num_outputs, 10)
    };
    
    const output = await replicate.run(model, { input });
    
    if (output && output.length > 0) {
      res.json({ imageUrls: output }); // Отправляем массив картинок
    } else { 
      throw new Error('Replicate API не вернул изображение.'); 
    }
  } catch (error) {
    console.error('!!! ОШИБКА REPLICATE:', error.message, error);
    res.status(500).json({ error: 'Не удалось сгенерировать изображение. Проверьте модель или кредиты.' });
  }
});

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
            const imageUrl = data.url || (data.images && data.images[0] ? data.images[0].url : null);
            if (!imageUrl) throw new Error('API не вернул правильный ответ.');
            res.json({ imageUrl: imageUrl });
        } else {
            res.json({ imageUrl: response.url });
        }
    } catch (error) {
        console.error(`!!! КРИТИЧЕСКАЯ ОШИБКА GET-IMAGE-FROM-SOURCE для ${url}:`, error.message);
        res.status(500).json({ error: 'Ошибка запроса к внешнему источнику.' });
    }
});

app.post('/feedback', async (req, res) => {
    try {
        const { type, message } = req.body;
        if (!type || !message) {
            return res.status(400).json({ error: 'Тип и сообщение обязательны.' });
        }
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.error('!!! КРИТИЧЕСКАЯ ОШИБКА: Секреты TELEGRAM не найдены!');
            return res.status(500).json({ error: 'Сервер не настроен для приема отзывов.' });
        }
        
        console.log(`-> FEEDBACK: Попытка отправки в Telegram...`);
        const title = type === 'bug' ? '🐞 Новый баг-репорт' : '💡 Новое предложение';
        const text = `<b>${title}</b>\n\n<pre>${message}</pre>`;
        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const tgResponse = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'User-Agent': BROWSER_HEADERS['User-Agent']
            },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
        });
        
        const responseData = await tgResponse.json();
        if (!responseData.ok) {
            console.error(`!!! ОШИБКА TELEGRAM API: ${responseData.description}`);
            throw new Error(responseData.description);
        }
        
        console.log('-> FEEDBACK: Сообщение успешно отправлено.');
        res.status(200).json({ success: true, message: 'Отзыв успешно отправлен!' });
    } catch(error) {
        console.error('!!! ОШИБКА ВНУТРИ /feedback:', error.message);
        res.status(500).json({ error: 'Ошибка отправки отзыва.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Сервер запущен и слушает порт ${PORT}. Все готово к работе!`); });

// --- КОНЕЦ ФАЙЛА server.js ---