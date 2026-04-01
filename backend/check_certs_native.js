const http = require('http');

http.get('http://127.0.0.1:5000/certificates', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const json = JSON.parse(data);
        if (json.certificates && json.certificates.length > 0) {
            console.log("CERT_DATA_START");
            console.log(JSON.stringify(json.certificates[0], null, 2));
            console.log("CERT_DATA_END");
        }
    });
});
