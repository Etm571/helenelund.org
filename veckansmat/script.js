let currentWeekIndex = 0;
let menuData = null;

async function fetchMenu() {
    try {
        const response = await fetch('https://helenelund.org/api/lunch');
        const data = await response.json();
        menuData = data;
        renderMenu(currentWeekIndex);
    } catch (error) {
        console.error('مشكلة تقنية:', error); // "Technical problem:"
        document.getElementById('menu-list').innerHTML = '<li>لا يمكن جلب القائمة في الوقت الحالي.</li>'; // "Cannot fetch menu at this time."
    }
}

async function translateText(text) {
    try {
        const response = await fetch('https://api-free.deepl.com/v2/translate', { // DeepL API endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                auth_key: '9b263022-5989-4179-9275-99841a707746:fx', // Replace with your DeepL API key
                text: text,
                target_lang: 'AR', // Arabic language code
            }),
        });
        const result = await response.json();
        return result.translations[0].text; // Extract the translated text
    } catch (error) {
        console.error('خطأ في الترجمة:', error); // "Translation error:"
        return text; // Fallback to the original text if translation fails
    }
}

async function renderMenu(weekIndex) {
    const menuList = document.getElementById('menu-list');
    const weekLabel = document.getElementById('week-label');
    menuList.innerHTML = '';

    if (menuData && menuData.weeks && menuData.weeks.length > weekIndex) {
        const weekData = menuData.weeks[weekIndex];
        const translatedWeekLabel = await translateText(`Vecka ${weekData.number}`); // Translate week label
        weekLabel.textContent = translatedWeekLabel;

        const today = new Date().setHours(0, 0, 0, 0);

        if (weekData.days && weekData.days.length > 0) {
            await Promise.all(weekData.days.map(async (day) => {
                const li = document.createElement('li');
                const date = new Date(day.date * 1000);
                const formattedDate = date.toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                const translatedDate = await translateText(formattedDate); // Translate date

                if (day.items && day.items.length > 0) {
                    const translatedItems = await Promise.all(day.items.map(item => translateText(item))); // Translate menu items
                    li.innerHTML = `<strong><span class="datum">${translatedDate}:</span></strong><br>${translatedItems.join('<br>')}`;
                } else {
                    li.innerHTML = `<strong><span class="datum">${translatedDate}:</span></strong><br>لا توجد قائمة متاحة لهذا اليوم.`; // "No menu available for this day."
                }

                if (date.setHours(0, 0, 0, 0) === today) {
                    li.classList.add('current-day');
                }

                menuList.appendChild(li);
            }));
        } else {
            menuList.innerHTML = '<li>لا توجد قائمة متاحة لهذا الأسبوع.</li>'; // "No menu available for this week."
        }
    } else {
        menuList.innerHTML = '<li>لا توجد بيانات قائمة متاحة.</li>'; // "No menu data available."
        weekLabel.textContent = 'الأسبوع -'; // "Week -"
    }
}

document.getElementById('prev-week-btn').addEventListener('click', () => {
    if (currentWeekIndex > 0) {
        currentWeekIndex--;
        renderMenu(currentWeekIndex);
    }
});

document.getElementById('next-week-btn').addEventListener('click', () => {
    if (menuData && currentWeekIndex < menuData.weeks.length - 1) {
        currentWeekIndex++;
        renderMenu(currentWeekIndex);
    }
});

window.onload = fetchMenu;
