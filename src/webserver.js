import express from 'express';
import {resolve} from 'path';
import * as fs from 'fs';
import bodyParser from 'body-parser'; 'body-parser';
import * as url from 'url';
import * as rosterLink from './roster-link.js';
import Humanforce from 'humanforced/humanforce.js';
import generate from './generate-roster-ics.js';
import getSession from './humanforce-session-manager.js';

const port = parseInt(process.env.PORT ?? 80);
const app = express();

const baseUrl = process.env.BASE_URL ?? 'http://localhost/';
const staticDirectory = resolve('./', 'www');

app.use(bodyParser.urlencoded({extended: true}));

app.post('/', async (req, res) => {
    const options = {};

    if (req.body.location && req.body.location.length > 0) options.location = req.body.location;
    if (req.body.reminderMins && !isNaN(parseInt(req.body.reminderMins))) options.reminderMins = parseInt(req.body.reminderMins);

    //res.redirect('/roster.ics?' + rosterLink.generate(req.body.email, req.body.password, options));

    let page = await fs.promises.readFile(resolve(staticDirectory, 'result.html'), 'utf-8');
    page = page.replaceAll('{link}', baseUrl + 'roster.ics?' + rosterLink.generate(req.body.email, req.body.password, options));

    res.header('Content-Type', 'text/html');
    res.end(page);
});

app.get('/result.html', (req, res) => { res.status(400).end('Bad Request'); });

app.get('/roster.ics', async (req, res) => {
    const queryString = url.parse(req.url).query;
    const data = rosterLink.parse(queryString);

    console.log(`Roster ical request for ${data.email}`);

    const humanforce = await getSession(data.email, data.password);

    res.header('Content-Type', 'text/calendar');
    res.header('Cache-Control', 'no-cache');
    res.end(await generate(humanforce, data.options));
});

app.use(express.static(staticDirectory));

console.log('Starting web server...');
app.listen(port, () => {
    console.log(`Web server running on port ${port}.`);
});
