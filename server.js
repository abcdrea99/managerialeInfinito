const express = require('express');
const cors = require('cors');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

app.use(cors());

const LEAGUE_URL = 'https://leghe.fantacalcio.it/slf-super-league';

function extractObjectAfterKey(text, key) {
    const keyIndex = text.indexOf(key);

    if (keyIndex === -1) {
        return null;
    }

    const colonIndex = text.indexOf(':', keyIndex);
    const startIndex = text.indexOf('{', colonIndex);

    if (startIndex === -1) {
        return null;
    }

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = startIndex; i < text.length; i++) {
        const char = text[i];

        if (escaped) {
            escaped = false;
            continue;
        }

        if (char === '\\') {
            escaped = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (!inString) {
            if (char === '{') depth++;
            if (char === '}') depth--;

            if (depth === 0) {
                return text.slice(startIndex, i + 1);
            }
        }
    }

    return null;
}

app.get('/api/debug-html', async (req, res) => {
    const response = await fetch(LEAGUE_URL, {
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'text/html'
        }
    });

    const html = await response.text();

    res.type('text/plain').send(html);
});

app.get('/', (req, res) => {
    res.send('Backend Manageriale Infinito attivo');
});

app.get('/api/classifica', async (req, res) => {
    try {
        const response = await fetch(LEAGUE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'text/html'
            }
        });

        const html = await response.text();
        const $ = cheerio.load(html);

        const classifica = [];

        $('.ranking-row').each((_, row) => {
            const $row = $(row);

            const id = Number($row.attr('data-id'));

            const shirtImg = $row.find('[data-key="shirt"] img').attr('src') || '';
            const teamName = $row.find('[data-key="teamName"] a').text().trim();
            const teamUrl = $row.find('[data-key="teamName"] a').attr('href') || '';
            const owners = $row.find('[data-key="all"]').text().trim();
            const logo = $row.find('[data-key="logo"]').text().trim();

            classifica.push({
                id,
                pos: Number($row.find('[data-key="index"] span').text().trim()),
                teamName,
                teamUrl,
                shirtImg,
                owners,
                logo,
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
                )
            });
        });

        if (!classifica.length) {
            return res.status(500).json({
                error: 'Classifica non trovata nell’HTML'
            });
        }

        res.json(classifica.sort((a, b) => a.pos - b.pos));
    } catch (error) {
        res.status(500).json({
            error: 'Errore nel recupero classifica',
            detail: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server attivo su http://localhost:${PORT}`);
});