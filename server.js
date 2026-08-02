const express = require('express');
const sendHandler = require('./api/send');
const verifyHandler = require('./api/verify');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/send', (req, res) => sendHandler(req, res));
app.post('/api/verify', (req, res) => verifyHandler(req, res));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
