const express = require('express');
const cors = require('cors');
const app = express();
const port = 9000;
const scrapeExito = require('./scrapers/Exito');
const scrapeAlkosto = require('./scrapers/Alkosto');
const scrapeMercadoLibre = require('./scrapers/MercadoLibre');
const scrapeFalabella = require('./scrapers/Falabella');
const scrapeOlimpica = require('./scrapers/Olimpica');


app.use(cors());
app.use(express.static('public'));
async function runParallelSearchesAndSave(searchQuery) {
    try {
        // Empieza a realizar las búsquedas en paralelo
        const [alkosto, exito, falabella, mercadolibre, olimpica] = await Promise.all([
            // Alkosto
            scrapeAlkosto(searchQuery).then(result => {
                console.log('Alkosto search finished');
                return result;
            }),
            // Éxito
            scrapeExito(searchQuery).then(result => {
                console.log('Éxito search finished');
                return result;
            }),
            // Falabella
            scrapeFalabella(searchQuery).then(result => {
                console.log('Falabella search finished');
                return result;
            }),
            // MercadoLibre
            scrapeMercadoLibre(searchQuery).then(result => {
                console.log('MercadoLibre search finished');
                return result;
            }),
            //Olimpica
            scrapeOlimpica(searchQuery).then(result => {
                console.log('Olimpica search finished');
                return result;
            })
        ]);
        
        // Concatena los resultados en un solo array
        return [].concat(mercadolibre, alkosto, exito, falabella);
    } catch (error) {
        console.error('Error during parallel searches:', error);
        throw error; 
    }
}



app.get('/search', async (req, res) => {
    console.log('Buscando productos...');
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
