const fetch = require('node-fetch');

async function check() {
    try {
        const res = await fetch('http://127.0.0.1:5000/certificates');
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

check();
