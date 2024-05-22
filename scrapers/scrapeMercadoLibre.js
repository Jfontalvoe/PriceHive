const puppeteer = require('puppeteer');

async function scrapeMercadoLibre(searchQuery) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');

    await page.goto('https://listado.mercadolibre.com.co/' + encodeURIComponent(searchQuery), { waitUntil: 'networkidle0' });
    await page.waitForSelector('.ui-search-result__wrapper', { timeout: 10000 });

    const filteredProducts = await page.evaluate((query) => {
        function normalizeString(str) {
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        }

        function queryMatchTitle(query, title) {
            const queryWords = normalizeString(query).split(/\s+/);
            const titleWords = normalizeString(title).split(/\s+/);
            return queryWords.every(qWord => titleWords.includes(qWord));
        }

        const productCards = document.querySelectorAll('.ui-search-result__wrapper');
        const limitedProducts = Array.from(productCards).slice(0, 5).map(card => {
            const title = card.querySelector('.ui-search-item__title') ? card.querySelector('.ui-search-item__title').innerText : 'No title available';
            const price = card.querySelector('.ui-search-price__second-line .andes-money-amount__fraction') ? parseInt(card.querySelector('.ui-search-price__second-line .andes-money-amount__fraction').innerText.replace(/\D/g, ''), 10) : 0;
            const link = card.querySelector('.ui-search-link') ? card.querySelector('.ui-search-link').href : 'Link no available';
            const imageUrl = card.querySelector('img.ui-search-result-image__element') ? card.querySelector('img.ui-search-result-image__element').src : 'No image available';
            return { title, price, link, imageUrl, storeName: 'MercadoLibre' };
        })
        .filter(product => queryMatchTitle(query, product.title));
        return limitedProducts.sort((a, b) => a.price - b.price).slice(0, 3);
    }, searchQuery);

    await browser.close();
    return filteredProducts;
}

module.exports = scrapeMercadoLibre;
