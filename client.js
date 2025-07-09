// --- НАЧАЛО ФАЙЛА client.js (ИСПРАВЛЕННЫЙ) ---

// client.js - v10 (DIAMOND PATCH 2.0)
document.addEventListener('DOMContentLoaded', () => {
    // Код элементов и констант
    // client.js
const elements = {
    // selectAllBtn: document.getElementById('select-all-btn'), // <-- УДАЛИТЬ или закомментировать
    // deselectAllBtn: document.getElementById('deselect-all-btn'), // <-- УДАЛИТЬ или закомментировать
    selectionControls: document.getElementById('selection-controls'), // <-- ДОБАВИТЬ
    selectAllCheckbox: document.getElementById('select-all-checkbox'), // <-- ДОБАВИТЬ
    /* ...остальные элементы без изменений... */
};
       const DB_NAME = 'AnimeGalleryDB_V18_Diamond', DB_VERSION = 1, STORE_SETTINGS = 'settings', STORE_GALLERY = 'gallery', STORE_BACKGROUNDS = 'defaultBackgrounds';
    let state = { currentSort: 'date_desc', isFavFilterActive: false, currentCategory: 'waifu', currentLanguage: 'ru', contextedItemId: null, };
   // client.js
const categories = {
    'waifu': { keywords: 'anime, waifu, girl', sources: {
        random: 'https://api.waifu.im/search/?included_tags=waifu&is_nsfw=false',
        search: 'https://api.waifu.im/search/?included_tags=waifu&is_nsfw=false'
    } },
    'anime_gif': { keywords: 'anime, gif, animation', sources: {
        random: 'https://api.waifu.im/search/?included_tags=maid&gif=true&is_nsfw=false', // Ищем гифки с тегом 'maid'
        search: 'https://api.waifu.im/search/?included_tags=uniform&gif=true&is_nsfw=false' // Ищем гифки с тегом 'uniform'
    } },
    'cyberpunk': { keywords: 'cyberpunk, neon, futuristic, city', sources: { random: 'https://source.unsplash.com/1600x900/?cyberpunk', search: 'https://source.unsplash.com/1600x900/?cyberpunk,neon' } },
    'nature': { keywords: 'nature, landscape, mountains, forest', sources: { random: 'https://source.unsplash.com/1600x900/?nature', search: 'https://source.unsplash.com/1600x900/?landscape,nature' } },
    'games': { keywords: 'video game, fan art, gaming', sources: { random: 'https://source.unsplash.com/1600x900/?gaming,character', search: 'https://source.unsplash.com/1600x900/?video,game,art' } },
    'dark_anime': { keywords: 'dark fantasy, gothic, monster, horror art', sources: { random: 'https://source.unsplash.com/1600x900/?dark,fantasy,art', search: 'https://source.unsplash.com/1600x900/?gothic,art' } },
    'supercars': { keywords: 'supercar, sportscar, luxury car', sources: { random: 'https://source.unsplash.com/1600x900/?supercar', search: 'https://source.unsplash.com/1600x900/?sportscar' } },
};
    const themes = [ { id: "dark" }, { id: "light" }, { id: "gray" }, { id: "retro" }, { id: "dracula" }, { id: "nord" }, { id: "solarized" }, { id: "gruvbox" }, { id: "monokai" }, { id: "tomorrow_night" }, { id: "one_dark" }, { id: "cyberpunk" }, { id: "matrix" }, { id: "crimson" }, { id: "synthwave" } ];
    const styles = { 'no_style': '', 'anime': ', anime style, waifu', 'photorealistic': ', photorealistic, 4k, ultra detailed', 'fantasy': ', fantasy art, intricate details, epic scene', 'cyberpunk_style': ', cyberpunk style, neon lights', 'digital_painting': ', digital painting, concept art', 'low_poly': ', low poly, isometric' };
    const defaultBackgroundSources = [ { name: 'cyberpunk', url: './backgrounds/cyberpunk.jpg'}, { name: 'night-tokyo', url: './backgrounds/night-tokyo.jpg'}, { name: 'canyon', url: './backgrounds/canyon.jpg'}, { name: 'mountain-river', url: './backgrounds/mountain-river.jpg'}, { name: 'dark-fantasy', url: './backgrounds/dark-fantasy.jpg'}, { name: 'noir-landscape', url: './backgrounds/noir-landscape.jpg'}, { name: 'auto-night', url: './backgrounds/auto-night.jpg'}, { name: 'anime-city', url: './backgrounds/anime-city.jpg'}, { name: 'nier-2b', url: './backgrounds/nier-2b.jpg'}, { name: 'genos', url: './backgrounds/genos.png'} ];
    const openDb = () => new Promise((resolve, reject) => { const request = indexedDB.open(DB_NAME, DB_VERSION); request.onerror = () => reject("Не удалось открыть IndexedDB."); request.onupgradeneeded = e => { const db = e.target.result; if (!db.objectStoreNames.contains(STORE_SETTINGS)) db.createObjectStore(STORE_SETTINGS); if (!db.objectStoreNames.contains(STORE_GALLERY)) { const galleryStore = db.createObjectStore(STORE_GALLERY, { keyPath: 'id' }); galleryStore.createIndex('category', 'category', { unique: false }); } if (!db.objectStoreNames.contains(STORE_BACKGROUNDS)) db.createObjectStore(STORE_BACKGROUNDS, { keyPath: 'id' }); }; request.onsuccess = e => resolve(e.target.result); });
    const dbRequest = (storeName, type, ...args) => new Promise(async (resolve, reject) => { try { const db = await openDb(); const tx = db.transaction(storeName, type.startsWith('get') ? 'readonly' : 'readwrite'); const store = tx.objectStore(storeName); const req = store[type](...args); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(`Ошибка транзакции (${storeName}): ${req.error}`); } catch (e) { reject(e) } });
    // 👇 КОПИРУЙ ВСЁ ОТСЮДА 👇

const translations = {
    en: {
        settings: 'Settings',
        language: 'Language',
        new_generation: 'New Generation',
        generate_ai: '✨ Generate AI',
        find_online: '🌎 Find Online',
        random_image: '🎲 Random',
        save: '💾 Save',
        preview: '🔍 Preview',
        gallery: '📁 Gallery',
        upload_yours: '📥 Upload Yours',
        export: '📤 Export',
        set_as_bg: '🏞️ Set as Background',
        delete: '🗑 Delete',
        select_all: '✅ Select All',
        deselect_all: '🔲 Deselect All',
        select_all_label: 'Select all on page', // <-- ИЗМЕНЕНИЕ #1
        choose_theme: '🎨 Choose Theme',
        background: '🖼️ Background',
        sorting: '🔀 Sorting',
        changelog: '🏆 Hall of Fame & Versions',
        report_bug: '🐞 Report a Bug',
        suggest_idea: '💡 Suggest an Idea',
        clear_gallery: '🗑️ Clear Gallery',
        themes: '🎨 Themes',
        backgrounds: '🖼️ Backgrounds',
        upload_your_bg: '📤 Upload your background',
        sort_newest: 'Newest first',
        sort_oldest: 'Oldest first',
        sort_random: 'Random',
        sort_favorites: '✅ Favorites only',
        cat_waifu: 'Waifu',
        cat_anime_gif: 'Anime Gifs',
        cat_cyberpunk: 'Cyberpunk',
        cat_nature: 'Nature',
        cat_games: 'Games',
        cat_dark_anime: 'Dark Anime',
        cat_supercars: 'Supercars',
        style_no_style: '-- No Style --',
        style_anime: 'Anime / Waifu',
        style_photorealistic: 'Photorealistic',
        style_fantasy: 'Fantasy Art',
        style_cyberpunk_style: 'Cyberpunk',
        style_digital_painting: 'Digital Painting',
        style_low_poly: '3D (Low Poly)',
        ctx_rename: 'Rename',
        ctx_copy_prompt: 'Copy Prompt',
        prompt_placeholder: "Describe your idea here... (e.g., 'girl with red hair')",
        negative_prompt_placeholder: "❌ Negative prompt (what NOT to draw)",
        bug_report_desc: "Please describe the problem in as much detail as possible. What were you doing when it occurred?",
        bug_report_placeholder: "For example: When I click 'Export', nothing happens...",
        suggestion_desc: "Have an idea how to make the service better? Tell us!",
        suggestion_placeholder: "For example: It would be cool to add the ability to change the image size...",
        send: "Send"
    },
    ru: {
        settings: 'Настройки',
        language: 'Язык',
        new_generation: 'Новая генерация',
        generate_ai: '✨ Сгенерировать AI',
        find_online: '🌎 Найти в сети',
        random_image: '🎲 Случайное',
        save: '💾 Сохранить',
        preview: '🔍 Предпросмотр',
        gallery: '📁 Галерея',
        upload_yours: '📥 Загрузить своё',
        export: '📤 Экспорт',
        set_as_bg: '🏞️ Сделать фоном',
        delete: '🗑 Удалить',
        select_all: '✅ Выбрать всё',
        deselect_all: '🔲 Отменить всё',
        select_all_label: 'Выбрать всё на странице', // <-- ИЗМЕНЕНИЕ #2
        choose_theme: '🎨 Выбрать тему',
        background: '🖼️ Фон',
        sorting: '🔀 Сортировка',
        changelog: '🏆 Зал Славы и Версии',
        report_bug: '🐞 Сообщить о проблеме',
        suggest_idea: '💡 Предложить идею',
        clear_gallery: '🗑️ Очистить галерею',
        themes: '🎨 Темы',
        backgrounds: '🖼️ Фоны',
        upload_your_bg: '📤 Загрузить свой фон',
        sort_newest: 'Сначала новые',
        sort_oldest: 'Сначала старые',
        sort_random: 'Случайно',
        sort_favorites: '✅ Только избранное',
        cat_waifu: 'Вайфу',
        cat_anime_gif: 'Аниме Гифки',
        cat_cyberpunk: 'Киберпанк',
        cat_nature: 'Природа',
        cat_games: 'Игры',
        cat_dark_anime: 'Dark Anime',
        cat_supercars: 'Суперкары',
        style_no_style: '-- Без стиля --',
        style_anime: 'Аниме / Вайфу',
        style_photorealistic: 'Фотореализм',
        style_fantasy: 'Фэнтези Арт',
        style_cyberpunk_style: 'Киберпанк',
        style_digital_painting: 'Цифровой рисунок',
        style_low_poly: '3D (Low Poly)',
        ctx_rename: 'Переименовать',
        ctx_copy_prompt: 'Копировать промпт',
        prompt_placeholder: "Опиши свою идею здесь... (например, 'девушка с красными волосами')",
        negative_prompt_placeholder: "❌ Негативный промпт (что НЕ нужно рисовать)",
        bug_report_desc: "Пожалуйста, опишите проблему как можно подробнее. Что вы делали, когда она возникла?",
        bug_report_placeholder: "Например: Когда я нажимаю 'Экспорт', ничего не происходит...",
        suggestion_desc: "Есть идея, как сделать сервис лучше? Расскажите!",
        suggestion_placeholder: "Например: Было бы круто добавить возможность менять размер картинки...",
        send: "Отправить"
    }
};

// 👆 И ДОСЮДА 👆
    const setLanguage = (lang) => { state.currentLanguage = lang; localStorage.setItem('language', lang); const langPack = translations[lang] || translations.ru; document.querySelectorAll('[data-lang-key]').forEach(el => { const key = el.dataset.langKey; if (langPack[key]) el.textContent = langPack[key]; }); document.querySelectorAll('[data-lang-placeholder-key]').forEach(el => { const key = el.dataset.langPlaceholderKey; if (langPack[key]) el.placeholder = langPack[key]; }); renderCategories(); renderThemes(); renderStyles(); renderSortOptions(); };
    // client.js
const renderGallery = async () => {
    try {
        let allGalleryData = await dbRequest(STORE_GALLERY, 'getAll');
        elements.galleryContainer.innerHTML = "";
        let categoryData = allGalleryData.filter(item => item.category === state.currentCategory);
        let dataToRender = state.isFavFilterActive ? categoryData.filter(e => e.favorite) : [...categoryData];

        if (state.currentSort === 'date_asc') dataToRender.sort((a, b) => a.id - b.id);
        else if (state.currentSort === 'date_desc') dataToRender.sort((a, b) => b.id - a.id);
        else if (state.currentSort === 'random') {
            for (let i = dataToRender.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [dataToRender[i], dataToRender[j]] = [dataToRender[j], dataToRender[i]];
            }
        }

        // Показываем/скрываем панель выбора
        if (dataToRender.length > 0) { // <-- НОВАЯ СТРОКА
            elements.selectionControls.classList.remove('hidden'); // <-- НОВАЯ СТРОКА
        } else { // <-- НОВАЯ СТРОКА
            elements.selectionControls.classList.add('hidden'); // <-- НОВАЯ СТРОКА
        } // <-- НОВАЯ СТРОКА
        // Сбрасываем чекбокс при каждом рендере
        if (elements.selectAllCheckbox) elements.selectAllCheckbox.checked = false; // <-- НОВАЯ СТРОКА (с проверкой)

        dataToRender.forEach(entry => {
            const item = document.createElement('div');
            item.className = "gallery-item";
            item.dataset.id = entry.id;
            const img = document.createElement('img');
            img.src = entry.data;
            img.loading = "lazy";
            img.alt = entry.prompt;
            img.addEventListener('dblclick', () => viewImage(entry.data));
            const controls = document.createElement('div');
            controls.className = 'item-controls';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.className = 'select-checkbox';
            const fav = document.createElement('div');
            fav.innerText = entry.favorite ? '⭐' : '☆';
            fav.className = 'favorite-star';
            fav.addEventListener('click', (e) => {e.stopPropagation(); toggleFavorite(entry.id, !entry.favorite)});
            const menuBtn = document.createElement('button');
            menuBtn.className = 'item-menu-btn';
            menuBtn.innerHTML = '⋮';
            menuBtn.addEventListener('click', (e) => { e.stopPropagation(); showContextMenu(e.target, entry.id); });
            controls.append(cb, fav, menuBtn);
            item.append(img, controls);
            elements.galleryContainer.appendChild(item);
        });
    } catch (e) { showError(`Не удалось загрузить галерею: ${e.message}`); }
};
    const renderCategories = () => { elements.categoryControls.innerHTML = ''; const langPack = translations[state.currentLanguage] || translations.ru; for (const id of Object.keys(categories)) { const btn = document.createElement('button'); btn.dataset.categoryId = id; btn.textContent = langPack[`cat_${id}`] || id.replace(/_/g, ' '); if (id === state.currentCategory) btn.classList.add('active-category'); btn.addEventListener('click', () => handleCategoryClick(id)); elements.categoryControls.appendChild(btn); } };
    const renderThemes = () => { elements.themeGrid.innerHTML = ''; themes.forEach(t => { const c = document.createElement("div"); c.className = "preview-card"; c.dataset.theme = t.id; const themeName = t.id.charAt(0).toUpperCase() + t.id.slice(1).replace(/_/g, ' '); c.innerHTML = `<div class="preview-box theme-${t.id}"></div><div class="preview-name">${themeName}</div>`; elements.themeGrid.appendChild(c); }); };
    const renderStyles = () => { elements.styleSelector.innerHTML = ''; const langPack = translations[state.currentLanguage] || translations.ru; for (const [id, value] of Object.entries(styles)) { const option = document.createElement('option'); option.value = value; option.textContent = langPack[`style_${id}`] || id; elements.styleSelector.appendChild(option); } };
    const renderSortOptions = () => { const langPack = translations[state.currentLanguage] || translations.ru; const o = { 'date_desc': langPack.sort_newest, 'date_asc': langPack.sort_oldest, 'random': langPack.sort_random, 'separator': '---', 'filter_favorite': langPack.sort_favorites }; elements.sortGrid.innerHTML = ''; for (const [k, v] of Object.entries(o)) { if (k === 'separator') { elements.sortGrid.appendChild(document.createElement('hr')); continue; } const b = document.createElement('button'); b.className = 'panel-button'; b.dataset.sort = k; b.textContent = v; if (k === 'filter_favorite' && state.isFavFilterActive) b.classList.add('active-filter'); elements.sortGrid.appendChild(b); } };
    const renderBackgrounds = async () => { try { const storedBgs = await dbRequest(STORE_BACKGROUNDS, 'getAll'); elements.backgroundGrid.innerHTML = ''; document.querySelectorAll('#backgroundGrid [data-object-url]').forEach(el => URL.revokeObjectURL(el.dataset.objectUrl)); storedBgs.forEach(bg => { const objectURL = URL.createObjectURL(bg.blob); const c = document.createElement("div"); c.className = "preview-card"; c.dataset.bgId = bg.id; c.innerHTML = `<div class="preview-box" style="background-image: url(${objectURL});" data-object-url="${objectURL}"></div><div class="preview-name">${bg.id}</div>`; elements.backgroundGrid.appendChild(c); }); } catch(e) { console.error("Ошибка рендера фонов:", e); } };
    const showContextMenu = (buttonElement, itemId) => { hideContextMenu(); state.contextedItemId = itemId; const langPack = translations[state.currentLanguage] || translations.ru; const rect = buttonElement.getBoundingClientRect(); const menu = elements.contextMenu; menu.style.display = 'block'; menu.style.left = `${rect.left + window.scrollX}px`; menu.style.top = `${rect.bottom + window.scrollY + 5}px`; menu.innerHTML = `<button data-action="rename">${langPack.ctx_rename}</button><button data-action="copy-prompt">${langPack.ctx_copy_prompt}</button>`; };
    const hideContextMenu = () => { if(elements.contextMenu) elements.contextMenu.style.display = 'none'; };
    const setUIGeneratorState = (isLoading, message = '') => { const btns = [elements.generateBtn, elements.findSimilarBtn, elements.randomImageBtn, elements.randomPromptBtn]; btns.forEach(btn => { if(btn) btn.disabled = isLoading; }); elements.loader.classList.toggle('hidden', !isLoading); if (isLoading) { elements.loaderText.textContent = message; elements.imageContainer.innerHTML = ''; elements.errorMessage.classList.add('hidden'); elements.saveBtn.classList.add('hidden'); elements.previewBtn.classList.add('hidden'); } };
    const displayGeneratedImage = (imageUrl, prompt) => new Promise((resolve, reject) => { const img = new Image(); img.crossOrigin = "Anonymous"; img.src = imageUrl; img.alt = prompt; img.onload = () => { elements.imageContainer.innerHTML = ''; elements.imageContainer.appendChild(img); elements.saveBtn.classList.remove('hidden'); elements.previewBtn.classList.remove('hidden'); resolve(); }; img.onerror = () => reject(new Error("Не удалось загрузить изображение.")); });
    const showError = (message) => { elements.errorMessage.textContent = message; elements.errorMessage.classList.remove('hidden'); };
    const openPanel = (p) => { if(p) p.style.display = 'flex'; };
    const closePanel = (p) => { if(p) p.style.display = 'none'; };
    const viewImage = (src) => { if (elements.viewerImg && elements.imageViewer) { elements.viewerImg.src = src; openPanel(elements.imageViewer); }};
    const handleServerRequest = async (endpoint, body, loadingMessage, successMessage, promptText) => { setUIGeneratorState(true, loadingMessage); try { const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!response.ok) { let errorText = 'Ошибка ответа от сервера'; try { const errorData = await response.json(); errorText = errorData.error || errorText; } catch(e){} throw new Error(errorText); } const result = await response.json(); setUIGeneratorState(true, successMessage); await displayGeneratedImage(result.imageUrl, promptText); } catch (e) { showError(`Ошибка: ${e.message}`); console.error(`Ошибка в ${endpoint}:`, e); } finally { setUIGeneratorState(false); } };
    // client.js
// 👇 ЗАМЕНИ ВСЮ ФУНКЦИЮ ЦЕЛИКОМ НА ЭТОТ КОД 👇
const handleAiGeneration = async () => {
    const userPrompt = elements.promptInput.value.trim();
    const stylePrompt = elements.styleSelector.value;
    const category = categories[state.currentCategory];
    if (!userPrompt) { return showError('Введите описание.'); }
    const promptParts = [userPrompt, category.keywords, stylePrompt];
    const finalPrompt = promptParts.filter(p => p && p.trim() !== '').join(', ');
    const negativePrompt = elements.negativePromptInput.value.trim();
    
    // Добавляем категорию в запрос
    const categoryId = state.currentCategory;
    await handleServerRequest(
        '/generate-image',
        { prompt: finalPrompt, negative_prompt: negativePrompt, category: categoryId },
        'Отправка на сервер...',
        'AI-генерация...',
        userPrompt
    );
};
    const findSimilarOnline = async () => { const category = categories[state.currentCategory]; await handleServerRequest('/get-image-from-source', { url: category.sources.search }, 'Поиск в сети...', 'Загрузка...', `Поиск: ${category.keywords}`); };
    const getRandomImage = async () => { const category = categories[state.currentCategory]; await handleServerRequest('/get-image-from-source', { url: category.sources.random }, 'Ищем случайное...', 'Загрузка...', `Случайное: ${category.keywords}`); };
    // client.js
const addEntryToGallery = async (dataUrl, prompt, options = {}) => {
    const newEntry = {
        id: Date.now(),
        prompt: prompt || `image_${Date.now()}`,
        data: dataUrl,
        favorite: false,
        date: new Date().toISOString(),
        category: state.currentCategory,
        isAiGenerated: options.isAiGenerated || false // <-- Вот оно, наше новое поле
    };
    try {
        await dbRequest(STORE_GALLERY, 'put', newEntry);
        await renderGallery();
        alert("Сохранено!");
    } catch(e) {
        console.error(e);
        showError(`Ошибка сохранения в базу данных: ${e.message}`);
    }
};
    const handleCategoryClick = (categoryId) => { state.currentCategory = categoryId; localStorage.setItem('currentCategory', categoryId); renderCategories(); renderGallery(); };
    const applyTheme = (id) => { document.body.className = id ? `theme-${id}` : ''; document.body.classList.toggle('has-custom-bg', !!document.body.style.getPropertyValue('--bg-image-url')); localStorage.setItem("theme", id); };
    // client.js
const saveResultToGallery = async () => {
    const img = elements.imageContainer.querySelector('img');
    if (!img || !img.src) return;
    setUIGeneratorState(true, 'Сохранение...');
    try {
        const r = await fetch(img.src, {credentials: 'omit'});
        if (!r.ok) throw new Error("Сетевая ошибка при скачивании изображения");
        const blob = await r.blob();
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
        // 👇 ВОТ ИЗМЕНЕНИЕ 👇
        await addEntryToGallery(dataUrl, img.alt, { isAiGenerated: true });
    } catch (e) {
        console.error(e);
        showError("Ошибка сохранения: " + e.message);
    } finally {
        setUIGeneratorState(false);
    }
};
    const toggleFavorite = async (id, isFavorite) => { try { const entry = await dbRequest(STORE_GALLERY, 'get', id); if(entry) { entry.favorite = isFavorite; await dbRequest(STORE_GALLERY, 'put', entry); await renderGallery(); } } catch (e) { console.error(e); }};
    const deleteSelected = async () => { const selectedItems = document.querySelectorAll('.gallery-item .select-checkbox:checked'); if (selectedItems.length === 0) { alert("Ничего не выбрано."); return; } if (!confirm(`Вы уверены, что хотите удалить ${selectedItems.length} элемент(ов)?`)) return; for (const cb of selectedItems) { await dbRequest(STORE_GALLERY, 'delete', parseInt(cb.closest('.gallery-item').dataset.id)); } await renderGallery(); };
    const exportSelected = async () => { const selectedItems = document.querySelectorAll('.gallery-item .select-checkbox:checked'); if (selectedItems.length === 0) { alert("Ничего не выбрано"); return; } const zip = new JSZip(); for (const cb of selectedItems) { const item = await dbRequest(STORE_GALLERY, 'get', parseInt(cb.closest('.gallery-item').dataset.id)); if (item && item.data) { const fileName = (item.prompt ? item.prompt.replace(/[\\/:*?"<>|]/g, '').substring(0, 50) : `image_${item.id}`) || `image_${item.id}`; zip.file(`${fileName}.png`, item.data.split(',')[1], { base64: true }); } } zip.generateAsync({ type: "blob" }).then(content => { const a = document.createElement('a'); a.href = URL.createObjectURL(content); a.download = `anime_gallery_${Date.now()}.zip`; a.click(); URL.revokeObjectURL(a.href); }); };
    const clearGallery = async () => { if (confirm("Вы уверены, что хотите НАВСЕГДА удалить ВСЕ изображения из галереи?")) { await dbRequest(STORE_GALLERY, 'clear'); await renderGallery(); } };
    const handleUpload = (e) => { const f = e.target.files[0]; if (!f) return; if(confirm(`Вы уверены, что хотите добавить этот файл в категорию "${(translations[state.currentLanguage] || translations.ru)[`cat_${state.currentCategory}`]}"?`)) { const r = new FileReader(); r.onload = async (ev) => { setUIGeneratorState(true, 'Загрузка...'); try { await addEntryToGallery(ev.target.result, f.name); } catch(err) { showError(err.message); } finally { setUIGeneratorState(false); } }; r.readAsDataURL(f); } e.target.value = ''; };
    // client.js
// 👇 ЗАМЕНИ ВСЮ ФУНКЦИЮ ЦЕЛИКОМ НА ЭТОТ КОД 👇
const generateRandomPrompt = () => {
    const promptParts = {
        subject: ["портрет девушки", "рыцарь в доспехах", "одинокое дерево", "фэнтези город", "космический корабль", "дракон", "старый маг", "кибер-самурай"],
        details: ["светящиеся глаза", "в руках посох", "нежный взгляд", "капли дождя", "боевая поза", "в окружении бабочек", "с имплантами"],
        style: ["в стиле аниме 90-х", "в стиле киберпанк", "эпичное фэнтези", "мрачная атмосфера", "яркие цвета", "пастельные тона"],
        artist: ["от Artgerm", "от Greg Rutkowski", "от Makoto Shinkai", "в стиле Ghibli", "в стиле Riot Games"]
    };
    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const quality = "masterpiece, best quality, ultra-detailed, intricate details, sharp focus, professional";
    const subject = getRandomElement(promptParts.subject);
    const details = getRandomElement(promptParts.details);
    const style = getRandomElement(promptParts.style);
    const artist = getRandomElement(promptParts.artist);

    elements.promptInput.value = `${subject}, ${details}, ${style}, ${artist}, ${quality}`;
};
    const applyBackground = async (imageBlob) => { try { await dbRequest(STORE_SETTINGS, 'put', imageBlob, 'customBackground'); const objectURL = URL.createObjectURL(imageBlob); document.body.style.setProperty('--bg-image-url', `url(${objectURL})`); document.body.classList.add('has-custom-bg'); } catch(e) { console.error(e); showError("Не удалось сохранить фон: " + e.message); }};
    const resetBackground = async () => { try { await dbRequest(STORE_SETTINGS, 'delete', 'customBackground'); document.body.style.removeProperty('--bg-image-url'); document.body.classList.remove('has-custom-bg'); } catch(e) { console.error(e); showError("Не удалось удалить фон: " + e.message); }};
    const setBackgroundFromDefault = async (bgId) => { try { const bg = await dbRequest(STORE_BACKGROUNDS, 'get', bgId); if (bg) await applyBackground(bg.blob); } catch(e) { console.error(e); } };
    const handleBackgroundUpload = (e) => { const f = e.target.files[0]; if (!f || !f.type.startsWith('image/')) return; applyBackground(f); e.target.value = ''; };
    const setBackgroundFromGallery = async () => { const c = document.querySelectorAll('.gallery-item .select-checkbox:checked'); if (c.length !== 1) { alert("Выберите ровно одно изображение."); return; } try { const item = await dbRequest(STORE_GALLERY, 'get', parseInt(c[0].closest('.gallery-item').dataset.id)); if (!item || !item.data) return; const response = await fetch(item.data); if (!response.ok) throw new Error('Не удалось преобразовать в Blob'); const blob = await response.blob(); await applyBackground(blob); alert('Фон успешно установлен!');} catch(e) { console.error(e); showError(`Не удалось установить фон: ${e.message}`); }};
    const handleFeedbackSubmit = async (type) => { const textArea = elements[`${type}Text`]; const button = elements[`submit${type}Btn`]; const statusEl = elements[`${type}Status`]; if(!button || !statusEl || !textArea) return console.error('Не найдены элементы для формы', type); try { const message = textArea.value.trim(); if (!message) { statusEl.textContent = 'Поле не может быть пустым.'; statusEl.className = 'error'; statusEl.classList.remove('hidden'); return; } button.disabled = true; statusEl.textContent = 'Отправка...'; statusEl.className = 'success'; statusEl.classList.remove('hidden'); const response = await fetch(`/feedback`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, message }) }); if (!response.ok) { const result = await response.json(); throw new Error(result.error || 'Ошибка сервера'); } statusEl.textContent = 'Спасибо! Сообщение успешно отправлено.'; statusEl.className = 'success'; textArea.value = ''; } catch (error) { statusEl.textContent = `Ошибка: ${error.message}`; statusEl.className = 'error'; } finally { if (button) button.disabled = false; setTimeout(() => statusEl.classList.add('hidden'), 4000); } };
    // *** ИСПРАВЛЕНИЕ #4: Изменяем ключ, чтобы фоны перезагрузились ***
    const setupDefaultBackgrounds = async () => { try { const installed = await dbRequest(STORE_SETTINGS, 'get', 'backgrounds_installed_v_final_reset_4'); if (installed) return; elements.loader.classList.remove('hidden'); elements.loaderText.textContent = 'Первичная загрузка фонов...'; await dbRequest(STORE_BACKGROUNDS, 'clear'); for (const source of defaultBackgroundSources) { try { const response = await fetch(source.url); if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${source.name}`); const blob = await response.blob(); await dbRequest(STORE_BACKGROUNDS, 'put', { id: source.name, blob: blob }); console.log(`Фон "${source.name}" успешно загружен.`); } catch (e) { console.error(`Не удалось загрузить фон "${source.name}":`, e); } } await dbRequest(STORE_SETTINGS, 'put', true, 'backgrounds_installed_v_final_reset_4'); } catch(e) { console.error("Критическая ошибка при установке фонов:", e); showError("Не удалось загрузить стандартные фоны. Проверьте консоль."); } finally { elements.loader.classList.add('hidden'); } };
    const selectAllItems = (select = true) => { document.querySelectorAll('.gallery-item .select-checkbox').forEach(cb => cb.checked = select); };
    const init = async () => { await openDb(); await setupDefaultBackgrounds(); await renderBackgrounds(); state.currentSort = localStorage.getItem('gallerySort') || 'date_desc'; state.isFavFilterActive = localStorage.getItem('isFavFilterActive') === 'true'; state.currentCategory = localStorage.getItem('currentCategory') || 'waifu'; state.currentLanguage = localStorage.getItem('language') || 'ru'; applyTheme(localStorage.getItem('theme') || 'dark'); setLanguage(state.currentLanguage); renderGallery(); try { const savedBgBlob = await dbRequest(STORE_SETTINGS, 'get', 'customBackground'); if (savedBgBlob) { const objectURL = URL.createObjectURL(savedBgBlob); document.body.style.setProperty('--bg-image-url', `url(${objectURL})`); document.body.classList.add('has-custom-bg'); } } catch (e) { console.error("Не удалось загрузить кастомный фон из IndexedDB:", e); } };
    const closeAllPanels = () => document.querySelectorAll('.panel-overlay').forEach(p => closePanel(p));
    document.body.addEventListener('click', (e) => { if (elements.menuBtn && !elements.menuBtn.contains(e.target) && elements.dropdownMenu && !elements.dropdownMenu.contains(e.target)) { elements.dropdownMenu.style.display = 'none'; } if (elements.contextMenu && !elements.contextMenu.contains(e.target) && !e.target.classList.contains('item-menu-btn')) { hideContextMenu(); } });
    elements.menuBtn.addEventListener('click', (e) => { e.stopPropagation(); elements.dropdownMenu.style.display = (elements.dropdownMenu.style.display === 'block') ? 'none' : 'block'; });
    document.querySelectorAll('.panel-overlay').forEach(panel => {
        panel.addEventListener('click', (e) => {
            if (e.target.classList.contains('panel-close-btn')) { closePanel(panel); } 
            else if (e.target.classList.contains('panel-back-btn')) { closePanel(panel); openPanel(elements.settingsPanel); }
            else if (e.target === panel) { closePanel(panel); }
        });
    });
    const setupPanelButton = (btn, panel, shouldCloseDropdown = false) => { if(btn) btn.addEventListener('click', () => { closeAllPanels(); openPanel(panel); if(shouldCloseDropdown && elements.dropdownMenu) elements.dropdownMenu.style.display = 'none'; }); }
    setupPanelButton(elements.settingsOpenBtn, elements.settingsPanel, true); setupPanelButton(elements.themePanelOpenBtn, elements.themePanel); setupPanelButton(elements.backgroundPanelOpenBtn, elements.backgroundPanel); setupPanelButton(elements.sortPanelOpenBtn, elements.sortPanel); setupPanelButton(elements.changelogOpenBtn, elements.changelogPanel); setupPanelButton(elements.bugReportOpenBtn, elements.bugReportPanel); setupPanelButton(elements.suggestionOpenBtn, elements.suggestionPanel);
    elements.generateBtn.addEventListener('click', handleAiGeneration); elements.randomPromptBtn.addEventListener('click', generateRandomPrompt);
    elements.findSimilarBtn.addEventListener('click', findSimilarOnline);
    elements.randomImageBtn.addEventListener('click', getRandomImage);
    elements.saveBtn.addEventListener('click', saveResultToGallery);
    elements.previewBtn.addEventListener('click', () => { const img = elements.imageContainer.querySelector('img'); if (img) viewImage(img.src); });
    elements.uploadBtn.addEventListener('click', () => elements.uploadInput.click());
    elements.uploadInput.addEventListener('change', handleUpload);
    elements.exportBtn.addEventListener('click', exportSelected);
    elements.deleteBtn.addEventListener('click', deleteSelected);
    elements.themeResetBtn.addEventListener('click', () => applyTheme('dark'));
    elements.backgroundResetBtn.addEventListener('click', resetBackground);
    elements.backgroundUploadBtn.addEventListener('click', () => elements.backgroundUploadInput.click());
    elements.backgroundUploadInput.addEventListener('change', handleBackgroundUpload);
    elements.clearGalleryBtn.addEventListener('click', clearGallery);
    elements.setBgFromGalleryBtn.addEventListener('click', setBackgroundFromGallery);
    elements.langSwitcherBtn.addEventListener('click', () => { const nextLang = state.currentLanguage === 'ru' ? 'en' : 'ru'; setLanguage(nextLang); });
    elements.submitBugReportBtn.addEventListener('click', () => handleFeedbackSubmit('bug'));
    elements.submitSuggestionBtn.addEventListener('click', () => handleFeedbackSubmit('suggestion'));
    // client.js (в самом низу)
elements.selectAllCheckbox.addEventListener('change', (e) => {
    selectAllItems(e.target.checked);
});
    elements.sortGrid.addEventListener('click', async (e) => { const sortEl = e.target.closest('[data-sort]'); if (!sortEl) return; const sortType = sortEl.dataset.sort; if (sortType === 'filter_favorite') { state.isFavFilterActive = !state.isFavFilterActive; localStorage.setItem('isFavFilterActive', state.isFavFilterActive); renderGallery(); renderSortOptions(); } else { state.currentSort = sortType; localStorage.setItem('gallerySort', state.currentSort); renderGallery(); closePanel(elements.sortPanel); }});
    elements.themeGrid.addEventListener('click', (e) => { const themeEl = e.target.closest('[data-theme]'); if (themeEl) { applyTheme(themeEl.dataset.theme); }});
    elements.backgroundGrid.addEventListener('click', (e) => { const bgCard = e.target.closest('[data-bg-id]'); if (bgCard) { setBackgroundFromDefault(bgCard.dataset.bgId); } });
    elements.contextMenu.addEventListener('click', async (e) => { e.stopPropagation(); const action = e.target.dataset.action; if (!action || !state.contextedItemId) return; const item = await dbRequest(STORE_GALLERY, 'get', state.contextedItemId); if (!item) return; if (action === 'rename') { const newPrompt = prompt("Введите новый промпт:", item.prompt); if (newPrompt !== null && newPrompt.trim() !== "") { item.prompt = newPrompt; await dbRequest(STORE_GALLERY, 'put', item); await renderGallery(); } } if (action === 'copy-prompt') { if (item.prompt) { navigator.clipboard.writeText(item.prompt).then(() => alert('Промпт скопирован!')).catch(err => console.error('Ошибка копирования:', err)); } } hideContextMenu(); });

    init();
});

// --- КОНЕЦ ФАЙЛА client.js ---
