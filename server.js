import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const port = 3000;

app.use(cors());

const API_KEY = 'RGAPI-d71bcc7e-5d0f-445f-98db-259e2680b2c8';

app.get('/riot-api/:region/*', async (req, res) => {
    const region = req.params.region;
    const endpoint = req.params[0];
    const url = `https://${region}/${endpoint}`;

    try {
        const response = await fetch(url, {
            headers: {
                'X-Riot-Token': API_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while fetching data from Riot API' });
    }
});

app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});