let autoRefreshInterval;
let countdownInterval;
let items = [];

// Функция для сохранения предметов в localStorage
function saveItemsToLocalStorage() {
    localStorage.setItem('items', JSON.stringify(items));
}

// Функция для загрузки предметов из localStorage
function loadItemsFromLocalStorage() {
    const savedItems = localStorage.getItem('items');
    if (savedItems) {
        items = JSON.parse(savedItems);
    }
}

async function fetchItemTypes() {
    try {
        const response = await fetch('https://xplay.gg/api/items/getList');
        if (!response.ok) {
            throw new Error('Ошибка при получении данных.');
        }

        const data = await response.json();
        items = data.items.filter(item => item.Category === 'premium');
        
        // Сохранение предметов в localStorage
        saveItemsToLocalStorage();

        // Получаем уникальные типы предметов и объединяем типы
        const types = [...new Set(items.map(item => {
            if (item.WeaponName.includes('StatTrak™')) {
                return item.WeaponName.replace('StatTrak™', '').trim();
            }
            return item.WeaponName;
        }))];

        displayItemTypes(types);
    } catch (error) {
        alert(error.message);
    }
}

function displayItemTypes(types) {
    const itemTypeSelect = document.getElementById('item-type-select');
    itemTypeSelect.innerHTML = '<option value="">Выберите тип предмета</option>';

    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        itemTypeSelect.appendChild(option);
    });
}

function displayItemListByType(type) {
    const filteredItems = items.filter(item => {
        const weaponName = item.WeaponName.includes('StatTrak™') ? item.WeaponName.replace('StatTrak™', '').trim() : item.WeaponName;
        return weaponName === type;
    });

    const itemListDiv = document.getElementById('item-list');
    itemListDiv.innerHTML = '';

    if (filteredItems.length === 0) {
        itemListDiv.innerHTML = '<p>Нет элементов для выбранного типа.</p>';
        return;
    }

    const ul = document.createElement('ul');
    filteredItems.forEach(item => {
        const li = document.createElement('li');
        li.className = item.WeaponName.includes('StatTrak™') ? 'stat-trak-item' : '';
        li.innerHTML = `
            <p class="item-name">${item.SkinName}</p>
            <div class="dropdown-content">
                <p><strong>ID:</strong> ${item.ID}</p>
                <p><strong>Weapon:</strong> ${item.WeaponName}</p>
                <p><strong>Skin:</strong> ${item.SkinName}</p>
                <p><strong>Цена:</strong> ${item.XPrice}</p>
                <p><strong>Разблокируется:</strong> ${item.UnBannedDate}</p>
                <a href="https://xplay.gg/ru/store?itemId=${item.ID}#preview" target="_blank">Посмотреть в магазине</a>
            </div>
        `;
        li.onclick = () => fetchItemById(item.ID);
        ul.appendChild(li);
    });

    itemListDiv.appendChild(ul);
}

function displayNearestItems() {
    const sortedItems = items.slice().sort((a, b) => new Date(a.UnBannedDate) - new Date(b.UnBannedDate));
    const nearestItems = sortedItems.slice(0, 10);

    const itemListDiv = document.getElementById('item-list');
    itemListDiv.innerHTML = '';

    if (nearestItems.length === 0) {
        itemListDiv.innerHTML = '<p>Нет элементов для отображения.</p>';
        return;
    }

    const ul = document.createElement('ul');
    nearestItems.forEach(item => {
        const li = document.createElement('li');
        li.className = item.WeaponName.includes('StatTrak™') ? 'stat-trak-item' : '';
        li.innerHTML = `
            <p class="item-name">${item.SkinName}</p>
            <div class="dropdown-content">
                <p><strong>ID:</strong> ${item.ID}</p>
                <p><strong>Weapon:</strong> ${item.WeaponName}</p>
                <p><strong>Skin:</strong> ${item.SkinName}</p>
                <p><strong>Цена:</strong> ${item.XPrice}</p>
                <p><strong>Разблокируется:</strong> ${item.UnBannedDate}</p>
                <a href="https://xplay.gg/ru/store?itemId=${item.ID}#preview" target="_blank">Посмотреть в магазине</a>
            </div>
        `;
        li.onclick = () => fetchItemById(item.ID);
        ul.appendChild(li);
    });

    itemListDiv.appendChild(ul);
}

function fetchItemById(itemId) {
    const item = items.find(i => i.ID === itemId);
    if (item) {
        displayItem(item);
    } else {
        alert('Элемент с таким ID не найден.');
    }
}

function fetchItem() {
    const itemIdStr = document.getElementById('item-id').value.trim();
    if (!itemIdStr) {
        alert('Пожалуйста, введите ID элемента.');
        return;
    }

    const itemId = parseInt(itemIdStr, 10); // Преобразуем введенный ID в число
    fetchItemById(itemId);
}

function startAutoRefresh() {
    // Обновление данных каждые 30 секунд
    autoRefreshInterval = setInterval(fetchItem, 30000);
}

function stopAutoRefresh() {
    clearInterval(autoRefreshInterval);
}

function stopCountdown() {
    clearInterval(countdownInterval);
}

function displayItem(item) {
    const infoDiv = document.getElementById('info');
    if (!item) {
        infoDiv.innerHTML = 'Элемент не найден.';
        stopCountdown();
        stopAutoRefresh();
        return;
    }

    const now = new Date();
    const unbannedDate = new Date(item.UnBannedDate);
    const timeDiff = unbannedDate - now;

    function formatTimeDiff(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        const milliseconds = Math.floor(ms % 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }

    infoDiv.innerHTML = `<p>Выбранный скин: ${item.WeaponName} | ${item.SkinName}</p>
                          <p>ID: ${item.ID}</p>
                          <p>Цена: ${item.XPrice}</p>
                          <p>Разблокируется: ${item.UnBannedDate}</p>
                          <p class="time">Время до разблокировки: <span id="countdown">${formatTimeDiff(timeDiff)}</span></p>
                          <p><a href="https://xplay.gg/ru/store?itemId=${item.ID}#preview" target="_blank" class="link">Посмотреть в магазине</a></p>`;

    // Очистка предыдущего таймера
    stopCountdown();
    
    countdownInterval = setInterval(() => {
        const now = new Date();
        const timeDiff = unbannedDate - now;
        if (timeDiff <= 0) {
            document.getElementById('countdown').innerText = '00:00:00.000';
            stopCountdown();
            return;
        }
        document.getElementById('countdown').innerText = formatTimeDiff(timeDiff);
    }, 100);  // Обновление таймера каждые 0.1 секунды

    startAutoRefresh();  // Начать автоматическое обновление
}
// Функция для получения тега StatTrak (если он есть)
function getMarketStTag(searchString, weaponSt, weaponSv) {
    return weaponSt && searchString.includes('StatTrak™') ? 'StatTrak™' : 'Normal';
}

// Функция для выполнения запроса на Steam Market
// Функция для выполнения запроса на Steam Market с отладочной информацией
async function makeSteamRequest(requestUrl, button) {
    try {
        // Запрос на сервер Steam
        const response = await fetch(requestUrl);
        
        // Проверяем, если ответ успешный
        if (!response.ok) {
            console.error("Ошибка запроса:", response.status, response.statusText);
            button.innerHTML = 'Ошибка при загрузке цены';
            return;
        }
        
        // Получаем данные в формате JSON
        const data = await response.json();
        console.log("Ответ Steam:", data); // Выводим ответ для отладки

        // Проверяем, есть ли результаты
        if (data.results && data.results.length > 0) {
            const price = data.results[0].sell_listings[0].price / 100;  // Цена в Steam Market делится на 100
            button.innerHTML = `Цена: $${price.toFixed(2)}`;
        } else {
            button.innerHTML = 'Цена не найдена';
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        button.innerHTML = 'Ошибка';
    }
}


// Функция для создания кнопки загрузки цены
function createLoadPriceButton(searchString, price, weaponSt, weaponSv) {
    let statTrakTag = getMarketStTag(searchString, weaponSt, weaponSv);

    // Строим URL для запроса
    let requestUrl =
        "https://steamcommunity.com/market/search/render/?query=" +
        searchString +
        "&start=0&count=1&search_descriptions=0&sort_column=default&sort_dir=desc&appid=730" +
        "&category_730_ItemSet[]=any&category_730_ProPlayer[]=any&category_730_StickerCapsule[]=any" +
        "&category_730_TournamentTeam[]=any&category_730_Weapon[]=any&category_730_Quality[]=" +
        statTrakTag +
        "&norender=1";

    let button = document.createElement("button");
    button.className = "load-price-button";
    button.innerHTML = "Загрузить цену";

    // Добавляем обработчик клика на кнопку для получения цены
    button.addEventListener("click", function(event) {
        event.stopPropagation();
        makeSteamRequest(requestUrl, button);
    });

    return button;
}

function displayItemListByType(type) {
    const filteredItems = items.filter(item => {
        const weaponName = item.WeaponName.includes('StatTrak™') ? item.WeaponName.replace('StatTrak™', '').trim() : item.WeaponName;
        return weaponName === type;
    });

    const itemListDiv = document.getElementById('item-list');
    itemListDiv.innerHTML = '';

    if (filteredItems.length === 0) {
        itemListDiv.innerHTML = '<p>Нет элементов для выбранного типа.</p>';
        return;
    }

    const ul = document.createElement('ul');
    filteredItems.forEach(item => {
        const li = document.createElement('li');
        li.className = item.WeaponName.includes('StatTrak™') ? 'stat-trak-item' : '';
        li.innerHTML = `
            <p class="item-name">${item.SkinName}</p>
            <div class="dropdown-content">
                <p><strong>ID:</strong> ${item.ID}</p>
                <p><strong>Weapon:</strong> ${item.WeaponName}</p>
                <p><strong>Skin:</strong> ${item.SkinName}</p>
                <p><strong>Цена:</strong> ${item.XPrice}</p>
                <p><strong>Разблокируется:</strong> ${item.UnBannedDate}</p>
                <a href="https://xplay.gg/ru/store?itemId=${item.ID}#preview" target="_blank">Посмотреть в магазине</a>
            </div>
        `;
        // Добавляем кнопку для получения цены
        const loadPriceButton = createLoadPriceButton(item.SkinName, item.XPrice, item.WeaponName.includes('StatTrak™'), item.WeaponName);
        li.appendChild(loadPriceButton);
        ul.appendChild(li);
    });

    itemListDiv.appendChild(ul);
}


// Загрузка предметов из localStorage при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadItemsFromLocalStorage()
    // Проверяем текущую тему при загрузке страницы
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
    }
    

    // Обработчик переключения темы
    document.getElementById('toggle-theme-button').addEventListener('click', () => {
        document.body.classList.toggle('light-mode');

        // Сохраняем текущую тему в localStorage
        if (document.body.classList.contains('light-mode')) {
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.setItem('theme', 'dark');
        }
    });
});
