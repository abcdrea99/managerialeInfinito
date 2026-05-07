const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const LEAGUE_URL = 'https://leghe.fantacalcio.it/slf-super-league';
const distPath = path.join(__dirname, 'dist/manageriale-infinito/browser');

app.use(cors());
app.use(express.json());

app.get('/api/debug-html', async (req, res) => {
    try {
        const response = await fetch(LEAGUE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                Accept: 'text/html',
            },
        });

        const html = await response.text();
        res.type('text/plain').send(html);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/api/classifica', async (req, res) => {
    try {
        const response = await fetch(LEAGUE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                Accept: 'text/html',
            },
        });

        const html = await response.text();
        const $ = cheerio.load(html);

        const classifica = [];

        $('.ranking-row').each((_, row) => {
            const $row = $(row);

            classifica.push({
                id: Number($row.attr('data-id')),
                pos: Number($row.find('[data-key="index"] span').text().trim()),
                teamName: $row.find('[data-key="teamName"] a').text().trim(),
                teamUrl: $row.find('[data-key="teamName"] a').attr('href') || '',
                shirtImg: $row.find('[data-key="shirt"] img').attr('src') || '',
                owners: $row.find('[data-key="all"]').text().trim(),
                logo: $row.find('[data-key="logo"]').text().trim(),
                g: Number($row.find('[data-key="rank-g"] span').text().trim()),
                v: Number($row.find('[data-key="rank-v"] span').text().trim()),
                n: Number($row.find('[data-key="rank-n"] span').text().trim()),
                pr: Number($row.find('[data-key="rank-p"] span').text().trim()),
                gf: Number($row.find('[data-key="rank-gf"] span').text().trim()),
                gs: Number($row.find('[data-key="rank-gs"] span').text().trim()),
                d_r: Number($row.find('[data-key="rank-dr"] span').text().trim()),
                p: Number($row.find('[data-key="rank-pt"] span').text().trim()),
                s_p: Number(
                    $row
                        .find('[data-key="rank-fp"] span')
                        .text()
                        .trim()
                        .replace('.', '')
                        .replace(',', '.')
                ),
            });
        });

        if (!classifica.length) {
            return res.status(500).json({
                error: 'Classifica non trovata nell’HTML',
            });
        }

        res.json(classifica.sort((a, b) => a.pos - b.pos));
    } catch (error) {
        res.status(500).json({
            error: 'Errore nel recupero classifica',
            detail: error.message,
        });
    }
});

app.use(express.static(distPath));

app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server avviato sulla porta ${PORT}`);
});