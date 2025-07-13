// =================================================================
//          CLIENT.JS. ФИНАЛЬНЫЙ АККОРД. ЗАМЕНИТЬ ПОЛНОСТЬЮ.
// =================================================================

// client.js - v17 (THE ABSOLUTE FINAL - Rebuild)
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Сбор всех элементов и констант ---
    const elements = {
        generateBtn: document.getElementById('generate-btn'),
        findSimilarBtn: document.getElementById('find-similar-btn'),
        randomImageBtn: document.getElementById('random-image-btn'),
        promptInput: document.getElementById('prompt-input'),
        negativePromptInput: document.getElementById('negative-prompt-input'),
        styleSelector: document.getElementById('style-selector'),
        randomPromptBtn: document.getElementById('random-prompt-btn'),
        loader: document.getElementById('loader'),
        loaderText: document.getElementById('loader-text'),
        imageContainer: document.getElementById('result-image-container'),
        resultControls: document.querySelector('.result-controls'),
        errorMessage: document.getElementById('error-message'),
        saveBtn: document.getElementById('save-btn'),
        previewBtn: document.getElementById('preview-btn'),
        galleryContainer: document.getElementById('gallery'),
        categoryControls: document.getElementById('category-controls'),
        uploadBtn: document.getElementById('upload-btn'),
        uploadInput: document.getElementById('upload-input'),
        exportBtn: document.getElementById('export-selected-btn'),
        deleteBtn: document.getElementById('delete-selected-btn'),
        setBgFromGalleryBtn: document.getElementById('set-bg-from-gallery-btn'),
        selectionControls: document.getElementById('selection-controls'),
        selectAllCheckbox: document.getElementById('select-all-checkbox'),
        selectAiBtn: document.getElementById('select-ai-btn'),
        menuBtn: document.getElementById('menu-btn'),
        dropdownMenu: document.getElementById('dropdownMenu'),
        settingsPanel: document.getElementById('settingsPanel'),
        settingsOpenBtn: document.getElementById('settings-open-btn'),
        themePanel: document.getElementById('themePanel'),
        themePanelOpenBtn: document.getElementById('theme-panel-open-btn'),
        themeResetBtn: document.getElementById('theme-reset-btn'),
        sortPanel: document.getElementById('sortPanel'),
        sortPanelOpenBtn: document.getElementById('sort-panel-open-btn'),
        sortGrid: document.getElementById('sortGrid'),
        imageViewer: document.getElementById('image-viewer'),
        viewerImg: document.getElementById('viewer-img'),
        themeGrid: document.getElementById('themeGrid'),
        clearGalleryBtn: document.getElementById('gallery-clear-btn'),
        backgroundPanel: document.getElementById('backgroundPanel'),
        backgroundPanelOpenBtn: document.getElementById('background-panel-open-btn'),
        backgroundResetBtn: document.getElementById('background-reset-btn'),
        backgroundGrid: document.getElementById('backgroundGrid'),
        backgroundUploadBtn: document.getElementById('background-upload-btn'),
        backgroundUploadInput: document.getElementById('background-upload-input'),
        changelogOpenBtn: document.getElementById('changelog-open-btn'),
        bugReportOpenBtn: document.getElementById('bug-report-open-btn'),
        suggestionOpenBtn: document.getElementById('suggestion-open-btn'),
        changelogPanel: document.getElementById('changelogPanel'),
        changelogContentArea: document.getElementById('changelog-content-area'),
        bugReportPanel: document.getElementById('bugReportPanel'),
        suggestionPanel: document.getElementById('suggestionPanel'),
        bugReportText: document.getElementById('bug-report-text'),
        suggestionText: document.getElementById('suggestion-text'),
        submitBugReportBtn: document.getElementById('submit-bug-report-btn'),
        submitSuggestionBtn: document.getElementById('submit-suggestion-btn'),
        bugReportStatus: document.getElementById('bug-report-status'),
        suggestionStatus: document.getElementById('suggestion-status'),
        contextMenu: document.getElementById('context-menu'),
        langSwitcherBtn: document.getElementById('lang-switcher-btn'),
    };
    const DB_NAME = 'AnimeGalleryDB_V21_Rebuild', DB_VERSION = 1, STORE_SETTINGS = 'settings', STORE_GALLERY = 'gallery', STORE_BACKGROUNDS = 'defaultBackgrounds';
    let state = { currentSort: 'date_desc', isFavFilterActive: false, currentCategory: 'waifu', currentLanguage: 'ru', contextedItemId: null, lastAiResult: null, };
    const categories = { 'waifu': { keywords: 'anime, waifu, girl', sources: { random: 'https://api.waifu.im/search/?included_tags=waifu&is_nsfw=false', search: 'https://api.waifu.im/search/?included_tags=waifu&is_nsfw=false' } }, 'anime_gif': { keywords: 'anime, gif, animation', sources: { random: 'https://api.waifu.im/search/?included_tags=maid&gif=true&is_nsfw=false', search: 'https://api.waifu.im/search/?included_tags=uniform&gif=true&is_nsfw=false' } }, 'cyberpunk': { keywords: 'cyberpunk, neon, futuristic, city', sources: { random: 'https://source.unsplash.com/1600x900/?cyberpunk', search: 'https://source.unsplash.com/1600x900/?cyberpunk,neon' } }, 'nature': { keywords: 'nature, landscape, mountains, forest', sources: { random: 'https://source.unsplash.com/1600x900/?nature', search: 'https://source.unsplash.com/1600x900/?landscape,nature' } }, 'games': { keywords: 'video game, fan art, gaming', sources: { random: 'https://source.unsplash.com/1600x900/?gaming,character', search: 'https://source.unsplash.com/1600x900/?video,game,art' } }, 'dark_anime': { keywords: 'dark fantasy, gothic, monster, horror art', sources: { random: 'https://source.unsplash.com/1600x900/?dark,fantasy,art', search: 'https://source.unsplash.com/1600x900/?gothic,art' } }, 'supercars': { keywords: 'supercar, sportscar, luxury car', sources: { random: 'https://source.unsplash.com/1600x900/?supercar', search: 'https://source.unsplash.com/1600x900/?sportscar' } }, };
    const themes = [ { id: "dark" }, { id: "light" }, { id: "gray" }, { id: "retro" }, { id: "dracula" }, { id: "nord" }, { id: "solarized" }, { id: "gruvbox" }, { id: "monokai" }, { id: "tomorrow_night" }, { id: "one_dark" }, { id: "cyberpunk" }, { id: "matrix" }, { id: "crimson" }, { id: "synthwave" } ];
    const styles = { 'no_style': '', 'anime': ', anime style, waifu', 'photorealistic': ', photorealistic, 4k, ultra detailed', 'fantasy': ', fantasy art, intricate details, epic scene', 'cyberpunk_style': ', cyberpunk style, neon lights', 'digital_painting': ', digital painting, concept art', 'low_poly': ', low poly, isometric' };
    const defaultBackgroundSources = [ { name: 'cyberpunk', url: './backgrounds/cyberpunk.jpg'}, { name: 'night-tokyo', url: './backgrounds/night-tokyo.jpg'}, { name: 'canyon', url: './backgrounds/canyon.jpg'}, { name: 'mountain-river', url: './backgrounds/mountain-river.jpg'}, { name: 'dark-fantasy', url: './backgrounds/dark-fantasy.jpg'}, { name: 'noir-landscape', url: './backgrounds/noir-landscape.jpg'}, { name: 'auto-night', url: './backgrounds/auto-night.jpg'}, { name: 'anime-city', url: './backgrounds/anime-city.jpg'}, { name: 'nier-2b', url: './backgrounds/nier-2b.jpg'}, { name: 'genos', url: './backgrounds/genos.png'} ];
    const translations = { en: { select_all_label: 'Select all', select_ai_only_label: 'Select AI only', /* Добавь остальные переводы сюда */ }, ru: { select_all_label: 'Выбрать всё', select_ai_only_label: 'Выбрать только AI', /* Добавь остальные переводы сюда */ } };
    
    // --- 2. Основные функции ---
    const openDb = () => new Promise((resolve, reject) => { const request = indexedDB.open(DB_NAME, DB_VERSION); request.onerror = () => reject("Не удалось открыть IndexedDB."); request.onupgradeneeded = e => { const db = e.target.result; if (!db.objectStoreNames.contains(STORE_SETTINGS)) db.createObjectStore(STORE_SETTINGS); if (!db.objectStoreNames.contains(STORE_GALLERY)) { const galleryStore = db.createObjectStore(STORE_GALLERY, { keyPath: 'id' }); galleryStore.createIndex('category', 'category', { unique: false }); } if (!db.objectStoreNames.contains(STORE_BACKGROUNDS)) db.createObjectStore(STORE_BACKGROUNDS, { keyPath: 'id' }); }; request.onsuccess = e => resolve(e.target.result); });
    const dbRequest = (storeName, type, ...args) => new Promise(async (resolve, reject) => { try { const db = await openDb(); const tx = db.transaction(storeName, type.startsWith('get') ? 'readonly' : 'readwrite'); const store = tx.objectStore(storeName); const req = store[type](...args); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(`Ошибка транзакции (${storeName}): ${req.error}`); } catch (e) { reject(e) } });
    const setLanguage = (lang) => { state.currentLanguage = lang; localStorage.setItem('language', lang); const langPack = translations[lang] || translations.ru; document.querySelectorAll('[data-lang-key]').forEach(el => { const key = el.dataset.langKey; if (langPack[key]) el.textContent = langPack[key]; }); document.querySelectorAll('[data-lang-placeholder-key]').forEach(el => { const key = el.dataset.langPlaceholderKey; if (langPack[key]) el.placeholder = langPack[key]; }); renderCategories(); renderThemes(); renderStyles(); renderSortOptions(); };
    const renderGallery = async () => { try { let allGalleryData = await dbRequest(STORE_GALLERY, 'getAll'); elements.galleryContainer.innerHTML = ""; let categoryData = allGalleryData.filter(item => item.category === state.currentCategory); let dataToRender = state.isFavFilterActive ? categoryData.filter(e => e.favorite) : [...categoryData]; if (state.currentSort === 'date_asc') dataToRender.sort((a, b) => a.id - b.id); else if (state.currentSort === 'date_desc') dataToRender.sort((a, b) => b.id - a.id); else if (state.currentSort === 'random') { for (let i = dataToRender.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [dataToRender[i], dataToRender[j]] = [dataToRender[j], dataToRender[i]]; } } if (dataToRender.length > 0) { elements.selectionControls.classList.remove('hidden'); } else { elements.selectionControls.classList.add('hidden'); } elements.selectAllCheckbox.checked = false; dataToRender.forEach(entry => { const item = document.createElement('div'); item.className = "gallery-item"; item.dataset.id = entry.id; const img = document.createElement('img'); img.src = entry.data; img.loading = "lazy"; img.alt = entry.prompt; img.addEventListener('dblclick', () => viewImage(entry.data)); const controls = document.createElement('div'); controls.className = 'item-controls'; const cb = document.createElement('input'); cb.type = 'checkbox'; cb.className = 'select-checkbox'; const fav = document.createElement('div'); fav.innerText = entry.favorite ? '⭐' : '☆'; fav.className = 'favorite-star'; fav.addEventListener('click', (e) => {e.stopPropagation(); toggleFavorite(entry.id, !entry.favorite)}); const menuBtn = document.createElement('button'); menuBtn.className = 'item-menu-btn'; menuBtn.innerHTML = '⋮'; menuBtn.addEventListener('click', (e) => { e.stopPropagation(); showContextMenu(e.target, entry.id); }); controls.append(cb, fav, menuBtn); item.append(img, controls); elements.galleryContainer.appendChild(item); }); } catch (e) { showError(`Не удалось загрузить галерею: ${e.message}`); }};
    const renderCategories = () => { elements.categoryControls.innerHTML = ''; const langPack = translations[state.currentLanguage] || translations.ru; for (const id of Object.keys(categories)) { const btn = document.createElement('button'); btn.dataset.categoryId = id; btn.textContent = (langPack[`cat_${id}`] || id.replace(/_/g, ' ')); if (id === state.currentCategory) btn.classList.add('active-category'); btn.addEventListener('click', () => handleCategoryClick(id)); elements.categoryControls.appendChild(btn); } };
    const renderThemes = () => { elements.themeGrid.innerHTML = ''; themes.forEach(t => { const c = document.createElement("div"); c.className = "preview-card"; c.dataset.theme = t.id; const themeName = t.id.charAt(0).toUpperCase() + t.id.slice(1).replace(/_/g, ' '); c.innerHTML = `<div class="preview-box theme-${t.id}"></div><div class="preview-name">${themeName}</div>`; elements.themeGrid.appendChild(c); }); };
    const renderStyles = () => { elements.styleSelector.innerHTML = ''; const langPack = translations[state.currentLanguage] || translations.ru; for (const [id, value] of Object.entries(styles)) { const option = document.createElement('option'); option.value = value; option.textContent = (langPack[`style_${id}`] || id); elements.styleSelector.appendChild(option); } };
    const renderSortOptions = () => { const langPack = translations[state.currentLanguage] || translations.ru; const o = { 'date_desc': langPack.sort_newest, 'date_asc': langPack.sort_oldest, 'random': langPack.sort_random, 'separator': '---', 'filter_favorite': langPack.sort_favorites }; elements.sortGrid.innerHTML = ''; for (const [k, v] of Object.entries(o)) { if (k === 'separator') { elements.sortGrid.appendChild(document.createElement('hr')); continue; } const b = document.createElement('button'); b.className = 'panel-button'; b.dataset.sort = k; b.textContent = v; if (k === 'filter_favorite' && state.isFavFilterActive) b.classList.add('active-filter'); elements.sortGrid.appendChild(b); } };
    const renderBackgrounds = async () => { try { const storedBgs = await dbRequest(STORE_BACKGROUNDS, 'getAll'); elements.backgroundGrid.innerHTML = ''; document.querySelectorAll('#backgroundGrid [data-object-url]').forEach(el => URL.revokeObjectURL(el.dataset.objectUrl)); storedBgs.forEach(bg => { const objectURL = URL.createObjectURL(bg.blob); const c = document.createElement("div"); c.className = "preview-card"; c.dataset.bgId = bg.id; c.innerHTML = `<div class="preview-box" style="background-image: url(${objectURL});" data-object-url="${objectURL}"></div><div class="preview-name">${bg.id}</div>`; elements.backgroundGrid.appendChild(c); }); } catch(e) { console.error("Ошибка рендера фонов:", e); } };
    const showContextMenu = (buttonElement, itemId) => { hideContextMenu(); state.contextedItemId = itemId; const langPack = translations[state.currentLanguage] || translations.ru; const rect = buttonElement.getBoundingClientRect(); const menu = elements.contextMenu; menu.style.display = 'block'; menu.style.left = `${rect.left + window.scrollX}px`; menu.style.top = `${rect.bottom + window.scrollY + 5}px`; menu.innerHTML = `<button data-action="rename">${langPack.ctx_rename}</button><button data-action="copy-prompt">${langPack.ctx_copy_prompt}</button>`; };
    const hideContextMenu = () => { if(elements.contextMenu) elements.contextMenu.style.display = 'none'; };
    const setUIGeneratorState = (isLoading, message = '') => { const btns = [elements.generateBtn, elements.findSimilarBtn, elements.randomImageBtn, elements.randomPromptBtn]; btns.forEach(btn => { if(btn) btn.disabled = isLoading; }); elements.loader.classList.toggle('hidden', !isLoading); if (isLoading) { elements.loaderText.textContent = message; elements.imageContainer.innerHTML = ''; elements.errorMessage.classList.add('hidden'); elements.resultControls.classList.add('hidden'); } };
    const displayGeneratedImage = (imageUrl, prompt, isAiGenerated) => new Promise((resolve, reject) => { state.lastAiResult = { imageUrl, prompt, isAiGenerated }; const img = new Image(); img.crossOrigin = "Anonymous"; img.src = imageUrl; img.alt = prompt; img.onload = () => { elements.imageContainer.innerHTML = ''; elements.imageContainer.appendChild(img); elements.resultControls.classList.remove('hidden'); resolve(); }; img.onerror = () => reject(new Error("Не удалось загрузить изображение.")); });
    const showError = (message) => { elements.errorMessage.textContent = message; elements.errorMessage.classList.remove('hidden'); };
    const openPanel = (p) => { if(p) p.style.display = 'flex'; };
    const closePanel = (p) => { if(p) p.style.display = 'none'; };
    const viewImage = (src) => { if (elements.viewerImg && elements.imageViewer) { elements.viewerImg.src = src; openPanel(elements.imageViewer); }};
    const handleServerRequest = async (endpoint, body, loadingMessage, successMessage, promptText) => { setUIGeneratorState(true, loadingMessage); try { const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!response.ok) { let errorText = 'Ошибка ответа от сервера'; try { const errorData = await response.json(); errorText = errorData.error || errorText; } catch(e){} throw new Error(errorText); } const result = await response.json(); setUIGeneratorState(true, successMessage); await displayGeneratedImage(result.imageUrl, promptText, result.isAiGenerated); } catch (e) { showError(`Ошибка: ${e.message}`); console.error(`Ошибка в ${endpoint}:`, e); } finally { setUIGeneratorState(false); } };
    const handleAiGeneration = async () => { const userPrompt = elements.promptInput.value.trim(); const stylePrompt = elements.styleSelector.value; if (!userPrompt) { return showError('Введите описание.'); } const finalPrompt = `${userPrompt}${stylePrompt}`; const negativePrompt = elements.negativePromptInput.value.trim(); await handleServerRequest('/generate-image', { prompt: finalPrompt, negative_prompt: negativePrompt, category: state.currentCategory }, 'Отправка на сервер...', 'AI-генерация...', userPrompt); };
    const findSimilarOnline = async () => { const category = categories[state.currentCategory]; await handleServerRequest('/get-image-from-source', { url: category.sources.search }, 'Поиск в сети...', 'Загрузка...', `Поиск: ${category.keywords}`); };
    const getRandomImage = async () => { const category = categories[state.currentCategory]; await handleServerRequest('/get-image-from-source', { url: category.sources.random }, 'Ищем случайное...', 'Загрузка...', `Случайное: ${category.keywords}`); };
    const addEntryToGallery = async (dataUrl, prompt, isAi) => { const newEntry = { id: Date.now(), prompt: prompt || `image_${Date.now()}`, data: dataUrl, favorite: false, date: new Date().toISOString(), category: state.currentCategory, isAiGenerated: !!isAi }; try { await dbRequest(STORE_GALLERY, 'put', newEntry); await renderGallery(); } catch(e) { console.error(e); showError(`Ошибка сохранения в базу данных: ${e.message}`); } };
    const handleCategoryClick = (categoryId) => { state.currentCategory = categoryId; localStorage.setItem('currentCategory', categoryId); renderCategories(); renderGallery(); };
    const applyTheme = (id) => { document.body.className = id ? `theme-${id}` : ''; document.body.classList.toggle('has-custom-bg', !!document.body.style.getPropertyValue('--bg-image-url')); localStorage.setItem("theme", id); };
    const saveResultToGallery = async () => { if (!state.lastAiResult) return; setUIGeneratorState(true, 'Сохранение...'); try { const r = await fetch(state.lastAiResult.imageUrl, {credentials: 'omit'}); if (!r.ok) throw new Error("Сетевая ошибка при скачивании изображения"); const blob = await r.blob(); const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); }); await addEntryToGallery(dataUrl, state.lastAiResult.prompt, state.lastAiResult.isAiGenerated); } catch (e) { console.error(e); showError("Ошибка сохранения: " + e.message); } finally { setUIGeneratorState(false); } };
    const toggleFavorite = async (id, isFavorite) => { try { const entry = await dbRequest(STORE_GALLERY, 'get', id); if(entry) { entry.favorite = isFavorite; await dbRequest(STORE_GALLERY, 'put', entry); await renderGallery(); } } catch (e) { console.error(e); }};
    const deleteSelected = async () => { const selectedItems = document.querySelectorAll('.gallery-item .select-checkbox:checked'); if (selectedItems.length === 0) { alert("Ничего не выбрано."); return; } if (!confirm(`Вы уверены, что хотите удалить ${selectedItems.length} элемент(ов)?`)) return; for (const cb of selectedItems) { await dbRequest(STORE_GALLERY, 'delete', parseInt(cb.closest('.gallery-item').dataset.id)); } await renderGallery(); };
    const exportSelected = async () => { const selectedItems = document.querySelectorAll('.gallery-item .select-checkbox:checked'); if (selectedItems.length === 0) { alert("Ничего не выбрано"); return; } const zip = new JSZip(); for (const cb of selectedItems) { const item = await dbRequest(STORE_GALLERY, 'get', parseInt(cb.closest('.gallery-item').dataset.id)); if (item && item.data) { const fileName = (item.prompt ? item.prompt.replace(/[\\/:*?"<>|]/g, '').substring(0, 50) : `image_${item.id}`) || `image_${item.id}`; zip.file(`${fileName}.png`, item.data.split(',')[1], { base64: true }); } } zip.generateAsync({ type: "blob" }).then(content => { const a = document.createElement('a'); a.href = URL.createObjectURL(content); a.download = `anime_gallery_${Date.now()}.zip`; a.click(); URL.revokeObjectURL(a.href); }); };
    const clearGallery = async () => { if (confirm("Вы уверены, что хотите НАВСЕГДА удалить ВСЕ изображения из галереи?")) { await dbRequest(STORE_GALLERY, 'clear'); await renderGallery(); } };
    const handleUpload = (e) => { const f = e.target.files[0]; if (!f) return; if(confirm(`Вы уверены, что хотите добавить этот файл в категорию "${(translations[state.currentLanguage] || translations.ru)[`cat_${state.currentCategory}`]}"?`)) { const r = new FileReader(); r.onload = async (ev) => { setUIGeneratorState(true, 'Загрузка...'); try { await addEntryToGallery(ev.target.result, f.name, false); } catch(err) { showError(err.message); } finally { setUIGeneratorState(false); } }; r.readAsDataURL(f); } e.target.value = ''; };
    const generateRandomPrompt = () => { const promptParts = { subject: ["портрет девушки", "рыцарь в доспехах", "одинокое дерево", "фэнтези город", "космический корабль", "дракон", "старый маг", "кибер-самурай"], details: ["светящиеся глаза", "в руках посох", "нежный взгляд", "капли дождя", "боевая поза", "в окружении бабочек", "с имплантами"], style: ["в стиле аниме 90-х", "в стиле киберпанк", "эпичное фэнтези", "мрачная атмосфера", "яркие цвета", "пастельные тона"], artist: ["от Artgerm", "от Greg Rutkowski", "от Makoto Shinkai", "в стиле Ghibli", "в стиле Riot Games"] }; const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)]; elements.promptInput.value = `${getRandomElement(promptParts.subject)}, ${getRandomElement(promptParts.details)}, ${getRandomElement(promptParts.style)}, ${getRandomElement(promptParts.artist)}`; };
    const applyBackground = async (imageBlob) => { try { await dbRequest(STORE_SETTINGS, 'put', imageBlob, 'customBackground'); const objectURL = URL.createObjectURL(imageBlob); document.body.style.setProperty('--bg-image-url', `url(${objectURL})`); document.body.classList.add('has-custom-bg'); } catch(e) { console.error(e); showError("Не удалось сохранить фон: " + e.message); }};
    const resetBackground = async () => { try { await dbRequest(STORE_SETTINGS, 'delete', 'customBackground'); document.body.style.removeProperty('--bg-image-url'); document.body.classList.remove('has-custom-bg'); } catch(e) { console.error(e); showError("Не удалось удалить фон: " + e.message); }};
    const setBackgroundFromDefault = async (bgId) => { try { const bg = await dbRequest(STORE_BACKGROUNDS, 'get', bgId); if (bg) await applyBackground(bg.blob); } catch(e) { console.error(e); } };
    const handleBackgroundUpload = (e) => { const f = e.target.files[0]; if (!f || !f.type.startsWith('image/')) return; applyBackground(f); e.target.value = ''; };
    const setBackgroundFromGallery = async () => { const c = document.querySelectorAll('.gallery-item .select-checkbox:checked'); if (c.length !== 1) { alert("Выберите ровно одно изображение."); return; } try { const item = await dbRequest(STORE_GALLERY, 'get', parseInt(c[0].closest('.gallery-item').dataset.id)); if (!item || !item.data) return; const response = await fetch(item.data); if (!response.ok) throw new Error('Не удалось преобразовать в Blob'); const blob = await response.blob(); await applyBackground(blob); alert('Фон успешно установлен!');} catch(e) { console.error(e); showError(`Не удалось установить фон: ${e.message}`); }};
    const handleFeedbackSubmit = async (type) => { const textElement = (type === 'bug') ? elements.bugReportText : elements.suggestionText; const buttonElement = (type === 'bug') ? elements.submitBugReportBtn : elements.submitSuggestionBtn; const statusElement = (type === 'bug') ? elements.bugReportStatus : elements.suggestionStatus; if (!textElement || !buttonElement || !statusElement) { console.error(`Элементы для формы '${type}' не найдены!`); return; } const message = textElement.value.trim(); if (!message) { statusElement.textContent = 'Поле не может быть пустым.'; statusElement.className = 'error'; statusElement.classList.remove('hidden'); return; } buttonElement.disabled = true; statusElement.textContent = 'Отправка...'; statusElement.className = 'success'; statusElement.classList.remove('hidden'); try { const response = await fetch('/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, message }) }); const result = await response.json(); if (!response.ok) { throw new Error(result.error || 'Ошибка на сервере'); } statusElement.textContent = 'Спасибо! Сообщение успешно отправлено.'; statusElement.className = 'success'; textElement.value = ''; } catch (error) { statusElement.textContent = `Ошибка: ${error.message}`; statusElement.className = 'error'; } finally { buttonElement.disabled = false; setTimeout(() => statusElement.classList.add('hidden'), 5000); } };
    const setupDefaultBackgrounds = async () => { try { const installed = await dbRequest(STORE_SETTINGS, 'get', 'backgrounds_installed_v_final_reset_6'); if (installed) return; elements.loader.classList.remove('hidden'); elements.loaderText.textContent = 'Первичная загрузка фонов...'; await dbRequest(STORE_BACKGROUNDS, 'clear'); for (const source of defaultBackgroundSources) { try { const response = await fetch(source.url); if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${source.name}`); const blob = await response.blob(); await dbRequest(STORE_BACKGROUNDS, 'put', { id: source.name, blob: blob }); console.log(`Фон "${source.name}" успешно загружен.`); } catch (e) { console.error(`Не удалось загрузить фон "${source.name}":`, e); } } await dbRequest(STORE_SETTINGS, 'put', true, 'backgrounds_installed_v_final_reset_6'); } catch(e) { console.error("Критическая ошибка при установке фонов:", e); showError("Не удалось загрузить стандартные фоны. Проверьте консоль."); } finally { elements.loader.classList.add('hidden'); } };
    const selectAllItems = (select = true) => { document.querySelectorAll('.gallery-item .select-checkbox').forEach(cb => cb.checked = select); };
    const selectAiItems = async () => { const allItems = document.querySelectorAll('.gallery-item'); for (const itemEl of allItems) { const id = parseInt(itemEl.dataset.id); try { const itemData = await dbRequest(STORE_GALLERY, 'get', id); if (itemData && itemData.isAiGenerated) { itemEl.querySelector('.select-checkbox').checked = true; } else { itemEl.querySelector('.select-checkbox').checked = false; } } catch(e) { console.error("Ошибка при проверке AI-метки для", id, e); } } };
    
    const init = async () => {
        try {
            await openDb();
            await setupDefaultBackgrounds();
            await renderBackgrounds();
            state.currentSort = localStorage.getItem('gallerySort') || 'date_desc';
            state.isFavFilterActive = localStorage.getItem('isFavFilterActive') === 'true';
            state.currentCategory = localStorage.getItem('currentCategory') || 'waifu';
            state.currentLanguage = localStorage.getItem('language') || 'ru';
            applyTheme(localStorage.getItem('theme') || 'dark');
            setLanguage(state.currentLanguage);
            renderGallery();
            const savedBgBlob = await dbRequest(STORE_SETTINGS, 'get', 'customBackground');
            if (savedBgBlob) {
                const objectURL = URL.createObjectURL(savedBgBlob);
                document.body.style.setProperty('--bg-image-url', `url(${objectURL})`);
                document.body.classList.add('has-custom-bg');
            }
        } catch (e) {
            console.error("КРИТИЧЕСКАЯ ОШИБКА ИНИЦИАЛИЗАЦИИ:", e);
            document.body.innerHTML = `<h1 style="color:red; text-align:center; margin-top: 50px;">Критическая ошибка. Пожалуйста, очистите кэш сайта (Ctrl+F5) и перезагрузите страницу.</h1>`;
        }
    };
    
    const setupEventListeners = () => {
        document.body.addEventListener('click', (e) => {
            if (elements.menuBtn && !elements.menuBtn.contains(e.target) && elements.dropdownMenu && !elements.dropdownMenu.contains(e.target)) {
                elements.dropdownMenu.style.display = 'none';
            }
            if (elements.contextMenu && !elements.contextMenu.contains(e.target) && !e.target.classList.contains('item-menu-btn')) {
                hideContextMenu();
            }
        });
        
        elements.menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.dropdownMenu.style.display = (elements.dropdownMenu.style.display === 'block') ? 'none' : 'block';
        });

        document.querySelectorAll('.panel-overlay').forEach(panel => {
            panel.addEventListener('click', (e) => {
                const target = e.target;
                if (target.classList.contains('panel-close-btn') || target === panel) { closePanel(panel); }
                else if (target.classList.contains('panel-back-btn')) { closePanel(panel); openPanel(elements.settingsPanel); }
            });
        });

        const setupPanelButton = (btn, panel, shouldCloseDropdown = false) => {
            if(btn) btn.addEventListener('click', () => {
                document.querySelectorAll('.panel-overlay').forEach(p => closePanel(p));
                openPanel(panel);
                if(shouldCloseDropdown && elements.dropdownMenu) elements.dropdownMenu.style.display = 'none';
            });
        };
        
        setupPanelButton(elements.settingsOpenBtn, elements.settingsPanel, false); // Новая кнопка настроек
        setupPanelButton(elements.themePanelOpenBtn, elements.themePanel);
        setupPanelButton(elements.backgroundPanelOpenBtn, elements.backgroundPanel);
        setupPanelButton(elements.sortPanelOpenBtn, elements.sortPanel);
        setupPanelButton(elements.changelogOpenBtn, elements.changelogPanel, true); // Кнопки из меню закрывают меню
        setupPanelButton(elements.bugReportOpenBtn, elements.bugReportPanel, true);
        setupPanelButton(elements.suggestionOpenBtn, elements.suggestionPanel, true);

        elements.generateBtn.addEventListener('click', handleAiGeneration);
        elements.randomPromptBtn.addEventListener('click', generateRandomPrompt);
        elements.findSimilarBtn.addEventListener('click', findSimilarOnline);
        elements.randomImageBtn.addEventListener('click', getRandomImage);
        elements.saveBtn.addEventListener('click', saveResultToGallery);
        elements.previewBtn.addEventListener('click', () => { if (state.lastAiResult) viewImage(state.lastAiResult.imageUrl); });
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
        
        elements.selectAllCheckbox.addEventListener('change', (e) => selectAllItems(e.target.checked));
        elements.selectAiBtn.addEventListener('click', selectAiItems);
        
        elements.sortGrid.addEventListener('click', async (e) => {
            const sortEl = e.target.closest('[data-sort]');
            if (!sortEl) return;
            const sortType = sortEl.dataset.sort;
            if (sortType === 'filter_favorite') {
                state.isFavFilterActive = !state.isFavFilterActive;
                localStorage.setItem('isFavFilterActive', state.isFavFilterActive);
                renderGallery();
                renderSortOptions();
            } else {
                state.currentSort = sortType;
                localStorage.setItem('gallerySort', state.currentSort);
                renderGallery();
            }
        });

        elements.themeGrid.addEventListener('click', (e) => {
            const themeEl = e.target.closest('[data-theme]');
            if (themeEl) { applyTheme(themeEl.dataset.theme); }
        });

        elements.backgroundGrid.addEventListener('click', (e) => {
            const bgCard = e.target.closest('[data-bg-id]');
            if (bgCard) { setBackgroundFromDefault(bgCard.dataset.bgId); }
        });
        
        elements.contextMenu.addEventListener('click', async (e) => {
            e.stopPropagation();
            const action = e.target.dataset.action;
            if (!action || !state.contextedItemId) return;
            const item = await dbRequest(STORE_GALLERY, 'get', state.contextedItemId);
            if (!item) return;
            if (action === 'rename') {
                const newPrompt = prompt("Введите новый промпт:", item.prompt);
                if (newPrompt !== null && newPrompt.trim() !== "") { item.prompt = newPrompt; await dbRequest(STORE_GALLERY, 'put', item); await renderGallery(); }
            }
            if (action === 'copy-prompt') {
                if (item.prompt) { navigator.clipboard.writeText(item.prompt).then(() => alert('Промпт скопирован!')).catch(err => console.error('Ошибка копирования:', err)); }
            }
            hideContextMenu();
        });
    };

    init().then(setupEventListeners);
});
