const axios = require('axios');
const crypto = require('crypto');

async function getSession() {
    const response = await axios.get('https://www.alightpro.my.id/api/session', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        timeout: 10000
    });
    return response.data;
}

function generatePow(nonce) {
    const target = '0000';
    for (let i = 0; i < 500000; i++) {
        const test = i.toString(16).padStart(8, '0');
        const hash = crypto.createHash('sha256').update(nonce + test).digest('hex');
        if (hash.startsWith(target)) {
            return test;
        }
    }
    return Date.now().toString(16);
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email wajib diisi' });
    }
    try {
        const session = await getSession();
        if (!session.token || !session.nonce) {
            throw new Error('Gagal mendapatkan session token');
        }
        const pow = generatePow(session.nonce);
        const response = await axios.post(
            'https://www.alightpro.my.id/api/alight-motion',
            { action: 'send', email },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Amprem-Token': session.token,
                    'X-Amprem-Nonce': session.nonce,
                    'X-Amprem-Pow': pow
                },
                timeout: 15000
            }
        );
        res.status(200).json(response.data);
    } catch (error) {
        const message = error.response?.data?.message || error.response?.data?.msg || error.message || 'Gagal mengirim magic link';
        res.status(500).json({ error: message });
    }
};
