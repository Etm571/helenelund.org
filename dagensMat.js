async function fetchMenu() {
    try {
        const response = await fetch('https://services.helenelund.org/api/lunch');
        if (!response.ok) {
            throw new Error('الاستجابة من الشبكة لم تكن جيدة'); // "Network response was not ok"
        }
        const data = await response.json();
        renderTodaysMenu(data);
    } catch (error) {
        console.error('خطأ أثناء جلب القائمة:', error); // "Error fetching menu:"
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
        return text; // Return the original text in case of an error
    }
}

async function renderTodaysMenu(menuData) {
    const matDiv = document.getElementById('mat');
    matDiv.innerHTML = '';

    if (menuData.weeks && menuData.weeks.length > 0) {
        const today = new Date();

        const todaysMenu = menuData.weeks[0].days.find(day => {
            const dayDate = new Date(day.date * 1000);
            return dayDate.toDateString() === today.toDateString();
        });

        if (todaysMenu) {
            const formattedDate = today.toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            // Prepare the items for translation
            const itemsToTranslate = todaysMenu.items;

            // Translate each item
            const translatedItems = await Promise.all(itemsToTranslate.map(item => translateText(item)));

            // Create the HTML for the menu
            const vegetarisk = `<span class="vegetarisk">(نباتي) ${translatedItems[0]}</span>`; // "(Vegetarian)"
            const kött = `<span class="kott">(لحوم) ${translatedItems.slice(1).join(', ')}</span>`; // "(Meat)"

            matDiv.innerHTML = `<strong>${formattedDate}:</strong><br>${kött}<br>${vegetarisk}`;
        } else {
            matDiv.innerHTML = '<p>لا توجد معلومات طعام متاحة لليوم.</p>'; // "No food information available for today."
        }
    } else {
        matDiv.innerHTML = '<p>لا توجد قائمة متاحة</p>'; // "No menu available"
    }
}

window.onload = fetchMenu;
