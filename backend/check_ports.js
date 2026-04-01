const net = require('net');

function checkPort(port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);

        socket.on('connect', () => {
            console.log(`Port ${port} is OPEN`);
            socket.destroy();
            resolve(true);
        });

        socket.on('timeout', () => {
            console.log(`Port ${port} TIMEOUT`);
            socket.destroy();
            resolve(false);
        });

        socket.on('error', (err) => {
            console.log(`Port ${port} CLOSED/ERROR: ${err.message}`);
            resolve(false);
        });

        socket.connect(port, '127.0.0.1');
    });
}

async function main() {
    console.log("Checking Ganache ports...");
    await checkPort(8545);
    await checkPort(7545);
    await checkPort(6545); // Just in case
    await checkPort(5000); // Check backend itself
}

main();
