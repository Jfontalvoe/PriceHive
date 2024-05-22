const puppeteer = require('puppeteer');

async function scrapeOlimpica(searchQuery) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');

    await page.goto('https://www.olimpica.com/' + encodeURIComponent(searchQuery))
    await page.waitForSelector('.vtex-product-summary-2-x-container', { timeout: 10000 });

    const filteredProducts = await page.evaluate((query) => {
        function normalizeString(str) {
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        }

        function queryMatchTitle(query, title) {
            const queryWords = normalizeString(query).split(/\s+/);
            const titleWords = normalizeString(title).split(/\s+/);
            return queryWords.every(qWord => titleWords.includes(qWord));
        }

        const productCards = document.querySelectorAll('.vtex-product-summary-2-x-container');
        const limitedProducts = Array.from(productCards).slice(0, 5).map(card => { 
            const title = card.querySelector('.vtex-product-summary-2-x-productNameContainer') ? card.querySelector('.vtex-product-summary-2-x-productNameContainer').innerText : 'No title available';
            const price = card.querySelector('.vtex-product-price-1-x-sellingPriceValue') ? card.querySelector('.vtex-product-price-1-x-sellingPriceValue').innerText.replace(/\D/g, '') : 'No price available';
            const link = card.querySelector('a.vtex-product-summary-2-x-clearLink') ? card.querySelector('a.vtex-product-summary-2-x-clearLink').href : 'No link available';
            const imageUrl = card.querySelector('.vtex-product-summary-2-x-imageNormal') ? card.querySelector('.vtex-product-summary-2-x-imageNormal').src : 'No image available';
            return { title, price, link, imageUrl, storeName: 'Olimpica' };
        })
        .filter(product => queryMatchTitle(query, product.title));
        return limitedProducts.sort((a, b) => a.price - b.price).slice(0, 3);
    }, searchQuery);

    await browser.close();
    return filteredProducts;
}

module.exports = scrapeOlimpica;
