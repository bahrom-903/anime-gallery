// --- НАЧАЛО ФАЙЛА client.js (ФИНАЛЬНЫЙ РЕМОНТ) ---
document.addEventListener('DOMContentLoaded', () => {
    // *** УЛУЧШЕННЫЙ СПИСОК AI-МОДЕЛЕЙ ***
    const AI_MODELS = [
        { name: "Аниме (Яркий стиль)", id: "p1xts/anime-pastel-dream:66b263166158739343ba8295b281f654b4243b7431215b4971a8143a579d479c" },
        { name: "Аниме (Реалистичный)", id: "cagliostrolab/animagine-xl-3.1:549a1a72c3a514de13e512495dcf74a3878d4948b3b7437876a44300305e7143" },
        { name: "Фотореализм (Общий)", id: "lucataco/absolute-reality:6d35593855518591fece36e2f694e2e6048a1a33748283a0026a09051375d15f" },
        { name: "Фэнтези (Детальный)", id: "p1xts/dreamshaper-v8:3c5291f9b8577262051684c9f7375279b324003013eb194dd446f28b293cc54f" },
        { name: "SD 2.1 (Быстрый)", id: "stability-ai/stable-diffusion-2-1:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf" },
    ];

    const elementIds = ['generateBtn', 'findSimilarBtn', 'randomImageBtn', 'promptInput', 'loader', 'loaderText', 'imageContainer', 'errorMessage', 'saveBtn', 'previewBtn', 'galleryContainer', 'uploadBtn', 'uploadInput', 'exportBtn', 'deleteBtn', 'menuBtn', 'dropdownMenu', 'settingsPanel', 'settingsOpenBtn', 'themePanel', 'themePanelOpenBtn', 'themeResetBtn', 'sortPanel', 'sortPanelOpenBtn', 'sortGrid', 'imageViewer', 'viewerImg', 'themeGrid', 'clearGalleryBtn', 'setBgFromGalleryBtn', 'backgroundPanel', 'backgroundPanelOpenBtn', 'backgroundResetBtn', 'backgroundGrid', 'backgroundUploadBtn', 'backgroundUploadInput', 'randomPromptBtn', 'negativePromptInput', 'modelSelector', 'imageCount', 'imageWidth', 'imageHeight', 'bugReportPanel', 'suggestionPanel', 'bugReportText', 'suggestionText', 'submitBugReportBtn', 'submitSuggestionBtn', 'bugReportStatus', 'suggestionStatus', 'contextMenu', 'categoryControls', 'langSwitcherBtn', 'changelogOpenBtn', 'changelogPanel', 'bugReportOpenBtn', 'suggestionOpenBtn', 'selectAllBtn', 'deselectAllBtn'];
    const elements = {};
    elementIds.forEach(id => elements[id] = document.getElementById(id));

    const DB_NAME = 'AnimeGalleryDB_V20_FinalFix', DB_VERSION = 1, STORE_SETTINGS = 'settings', STORE_GALLERY = 'gallery', STORE_BACKGROUNDS = 'defaultBackgrounds';
    let state = { currentSort: 'date_desc', isFavFilterActive: false, currentCategory: 'waifu' };
    const categories = { 'waifu': { sources: { random: 'https://api.waifu.pics/sfw/waifu' } }, 'anime_gif': { sources: { random: 'https://api.waifu.pics/sfw/dance' } }, 'cyberpunk': { sources: { random: 'https://source.unsplash.com/1600x900/?cyberpunk,neon,rain' } }, 'nature': { sources: { random: 'https://source.unsplash.com/1600x900/?nature,landscape' } }, 'games': { sources: { random: 'https://source.unsplash.com/1600x900/?gaming,character,art' } }, 'dark_anime': { sources: { random: 'https://source.unsplash.com/1600x900/?dark,fantasy,anime,art' } }, 'supercars': { sources: { random: 'https://source.unsplash.com/1600x900/?supercar,JDM' } }, };
    const defaultBackgroundSources = [ { name: 'cyberpunk', url: './backgrounds/cyberpunk.jpg'}, { name: 'night-tokyo', url: './backgrounds/night-tokyo.jpg'}, { name: 'canyon', url: './backgrounds/canyon.jpg'}, { name: 'mountain-river', url: './backgrounds/mountain-river.jpg'}, { name: 'dark-fantasy', url: './backgrounds/dark-fantasy.jpg'}, { name: 'noir-landscape', url: './backgrounds/noir-landscape.jpg'}, { name: 'auto-night', url: './backgrounds/auto-night.jpg'}, { name: 'anime-city', url: './backgrounds/anime-city.jpg'}, { name: 'nier-2b', url: './backgrounds/nier-2b.jpg'}, { name: 'genos', url: './backgrounds/genos.png'} ];
    
    const openDb = () => new Promise((res, rej) => { const r = indexedDB.open(DB_NAME, DB_VERSION); r.onerror = () => rej("DB Error"); r.onupgradeneeded = e => { const db = e.target.result; if (!db.objectStoreNames.contains(STORE_SETTINGS)) db.createObjectStore(STORE_SETTINGS); if (!db.objectStoreNames.contains(STORE_GALLERY)) db.createObjectStore(STORE_GALLERY, { keyPath: 'id' }); if (!db.objectStoreNames.contains(STORE_BACKGROUNDS)) db.createObjectStore(STORE_BACKGROUNDS, { keyPath: 'id' }); }; r.onsuccess = e => res(e.target.result); });
    const dbRequest = (store, type, ...args) => new Promise(async (res, rej) => { try { const db = await openDb(); const req = db.transaction(store, type.startsWith('get') ? 'readonly' : 'readwrite').objectStore(store)[type](...args); req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); } catch (e) { rej(e); } });

    const setUIGeneratorState = (isLoading, message = '') => {
        const btnsToDisable = [elements.generateBtn, elements.findSimilarBtn, elements.randomImageBtn, elements.randomPromptBtn];
        btnsToDisable.forEach(btn => btn && (btn.disabled = isLoading));
        elements.loader.classList.toggle('hidden', !isLoading);
        elements.imageContainer.style.display = isLoading ? 'none' : 'flex';
        if (isLoading) {
            elements.loaderText.textContent = message;
            elements.errorMessage.classList.add('hidden');
            elements.saveBtn.classList.add('hidden');
            elements.previewBtn.classList.add('hidden');
        }
    };
    const showError = (message) => { elements.errorMessage.textContent = `Ошибка: ${message}`; elements.errorMessage.classList.remove('hidden'); };

    const displayGeneratedImages = (urls, prompt) => {
        elements.imageContainer.innerHTML = '';
        urls.forEach(url => { const img = document.createElement('img'); img.src = url; img.alt = prompt; img.crossOrigin = "Anonymous"; elements.imageContainer.appendChild(img); });
        elements.saveBtn.classList.toggle('hidden', urls.length === 0);
        elements.previewBtn.classList.toggle('hidden', urls.length === 0);
    };

    const handleServerRequest = async (endpoint, body, loadingMessage) => {
        setUIGeneratorState(true, loadingMessage);
        try {
            const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Неизвестная ошибка сервера');
            setUIGeneratorState(false);
            return result;
        } catch (e) {
            showError(e.message);
            setUIGeneratorState(false);
            throw e;
        }
    };

    const handleAiGeneration = async () => {
        const prompt = elements.promptInput.value.trim();
        if (!prompt) return showError('Введите описание.');
        try {
            const result = await handleServerRequest('/generate-image', { prompt, negative_prompt: elements.negativePromptInput.value.trim(), model: elements.modelSelector.value, width: elements.imageWidth.value, height: elements.imageHeight.value, num_outputs: elements.imageCount.value }, 'AI-генерация...');
            if (result && result.imageUrls) displayGeneratedImages(result.imageUrls, prompt);
        } catch (e) {}
    };

    const getRandomImage = async () => {
        const category = categories[state.currentCategory];
        try {
            const result = await handleServerRequest('/get-image-from-source', { url: category.sources.random }, 'Ищем случайное...');
            if (result && result.imageUrl) displayGeneratedImages([result.imageUrl], " ");
        } catch (e) {}
    };

    const handleFeedbackSubmit = async (type) => {
        const textArea = elements[`${type}Text`];
        const statusEl = elements[`${type}Status`];
        const message = textArea.value.trim();
        if (!message) return;
        try {
            const result = await handleServerRequest('/feedback', { type, message }, 'Отправка...');
            statusEl.textContent = result.message; statusEl.className = 'success'; textArea.value = '';
        } catch (e) {
            statusEl.textContent = `Ошибка: ${e.message}`; statusEl.className = 'error';
        }
        statusEl.classList.remove('hidden'); setTimeout(() => statusEl.classList.add('hidden'), 4000);
    };

    const setupDefaultBackgrounds = async () => {
        try {
            const installed = await dbRequest(STORE_SETTINGS, 'get', 'backgrounds_installed_v_final_fix_2');
            if (installed) return;
            setUIGeneratorState(true, 'Первичная загрузка фонов...');
            await dbRequest(STORE_BACKGROUNDS, 'clear');
            for (const source of defaultBackgroundSources) {
                try {
                    const response = await fetch(source.url);
                    if (!response.ok) continue;
                    await dbRequest(STORE_BACKGROUNDS, 'put', { id: source.name, blob: await response.blob() });
                } catch (e) { console.error(`Не удалось загрузить фон: ${source.name}`); }
            }
            await dbRequest(STORE_SETTINGS, 'put', true, 'backgrounds_installed_v_final_fix_2');
            setUIGeneratorState(false);
            alert('Фоны успешно загружены! Страница будет перезагружена.');
            window.location.reload();
        } catch (e) {
            showError("Не удалось загрузить стандартные фоны. Попробуйте обновить страницу.");
            setUIGeneratorState(false);
        }
    };
    
    const init = async () => {
        AI_MODELS.forEach(model => {
            const option = document.createElement('option'); option.value = model.id; option.textContent = model.name;
            elements.modelSelector.appendChild(option);
        });

        Object.keys(categories).forEach(id => {
            const btn = document.createElement('button');
            btn.textContent = id.replace(/_/g, ' ');
            btn.addEventListener('click', () => {
                state.currentCategory = id;
                document.querySelector('#category-controls .active-category')?.classList.remove('active-category');
                btn.classList.add('active-category');
            });
            elements.categoryControls.appendChild(btn);
        });
        document.querySelector('#category-controls button').classList.add('active-category');

        elements.generateBtn.addEventListener('click', handleAiGeneration);
        elements.randomImageBtn.addEventListener('click', getRandomImage);
        elements.submitBugReportBtn.addEventListener('click', () => handleFeedbackSubmit('bug'));
        elements.submitSuggestionBtn.addEventListener('click', () => handleFeedbackSubmit('suggestion'));

        elements.selectAllBtn.addEventListener('click', () => {
            document.querySelectorAll('.gallery-item .select-checkbox').forEach(cb => cb.checked = true);
            elements.selectAllBtn.classList.add('selected');
            elements.deselectAllBtn.classList.remove('selected');
        });

        elements.deselectAllBtn.addEventListener('click', () => {
            document.querySelectorAll('.gallery-item .select-checkbox').forEach(cb => cb.checked = false);
            elements.deselectAllBtn.classList.add('selected');
            elements.selectAllBtn.classList.remove('selected');
        });

        try {
            await openDb();
            await setupDefaultBackgrounds();
        } catch (e) {
            showError(e.message);
        }
    };

    init();
});
// --- КОНЕЦ ФАЙЛА client.js ---