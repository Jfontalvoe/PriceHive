const puppeteer = require('puppeteer');

async function scrapeAlkosto(searchQuery) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');

    await page.goto('https://www.alkosto.com//search?text=' + encodeURIComponent(searchQuery) + '&sort=relevance', { waitUntil: 'networkidle0' });
    await page.waitForSelector('.product__item', { timeout: 10000 });

    const filteredProducts = await page.evaluate((query) => {
        function normalizeString(str) {
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        }

        function queryMatchTitle(query, title) {
            const queryWords = normalizeString(query).split(/\s+/);
            const titleWords = normalizeString(title).split(/\s+/);
            return queryWords.every(qWord => titleWords.includes(qWord));
        }

        const productCards = document.querySelectorAll('.product__item');
        const limitedProducts = Array.from(productCards).slice(0, 5).map(card => { 
            const title = card.querySelector('.product__item__top__title') ? card.querySelector('.product__item__top__title').innerText : 'No title available';
            const price = card.querySelector('.product__price--discounts__price') ? card.querySelector('.product__price--discounts__price').innerText.replace(/\D/g, '') : 'No price available';
            const link = card.querySelector('.product__item__top__title').getAttribute('data-url') ? window.location.origin + card.querySelector('.product__item__top__title').getAttribute('data-url') : 'Link no available';
            const imageUrl = card.querySelector('.product__item__information__image img') ? card.querySelector('.product__item__information__image img').src : 'No image available';
            return { title, price, link, imageUrl, storeName: 'Alkosto' };
        })  
        .filter(product => queryMatchTitle(query, product.title));
        return limitedProducts.sort((a, b) => a.price - b.price).slice(0, 3);
    }, searchQuery);

    await browser.close();
    return filteredProducts;
}

module.exports = scrapeAlkosto;
