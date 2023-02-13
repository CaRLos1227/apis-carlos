const request = require('request');
const http = require('http');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const apikey = JSON.parse(fs.readFileSync('./config.json')).apikey;
const functions = require('./routes/exports.js');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,DELETE,POST');
  app.use(cors());
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/pagina-inicial.html'));
});

app.get('/css/style.css', (req, res) => {
  res.sendFile(path.join(__dirname + '/css/style.css'));
});

app.get('/api/image-search', (req, res) => {
  functions.image(req, res, apikey);
});

app.get('/api/xvideos', (req, res) => {
  functions.xvideos(req, res, apikey);
});

app.get('/api/youtube-search', (req, res) => {
  functions.youtube(req, res, apikey);
});

app.get('/api/ytmp3', (req, res) => {
  functions.ytmp3(req, res, apikey);
});

app.get('/api/ig-download', (req, res) => {
  functions.download_instagram(req, res, apikey);
});

app.listen(port, () => {
  console.log(`server running in \"http://localhost:${port}\"`);
});