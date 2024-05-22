const express = require('express');
const cors = require('cors');
const scrapeAlkosto = require('./scrapers/scrapeAlkosto');
const scrapeExito = require('./scrapers/scrapeExito');
const scrapeFalabella = require('./scrapers/scrapeFalabella');
const scrapeMercadoLibre = require('./scrapers/scrapeMercadoLibre');
const scrapeOlimpica = require('./scrapers/scrapeOlimpica');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('public'));

async function runParallelSearchesAndSave(searchQuery) {
    const alkosto = await scrapeAlkosto(searchQuery);
    const exito = await scrapeExito(searchQuery);
    const falabella = await scrapeFalabella(searchQuery);
    const mercadolibre = await scrapeMercadoLibre(searchQuery);
    const olimpica = await scrapeOlimpica(searchQuery);
    return [].concat(mercadolibre, alkosto, exito, olimpica, falabella);
}

app.get('/search', async (req, res) => {
    const searchQuery = req.query.query;
    if (!searchQuery) {
        res.status(400).send("El término de búsqueda está vacío.");
        return;
    }

    try {
        const results = await runParallelSearchesAndSave(searchQuery);
        res.json(results);
    } catch (error) {
        console.error("Error durante la búsqueda:", error);
        res.status(500).send("Error al procesar su solicitud. Inténtalo de nuevo más tarde.");
    }

});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
