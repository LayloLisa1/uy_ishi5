const http = require('http');
const fs = require('fs');
const PORT = process.env.PORT || 3000;
const DATA_FILE = 'todo.json';
const server = http.createServer((req, res) => {
    const { method, url, headers } = req;

    let data = [];
    try {
        data = JSON.parse(fs.readFileSync(DATA_FILE));
    } catch (err) {
        console.error('Error loading data file:', err);
    }
    if (method === 'GET' && url === '/todos') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    } else if (method === 'POST' && url === '/todos') {

        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const newItem = JSON.parse(body);
            data.push(newItem);
            fs.writeFileSync(DATA_FILE, JSON.stringify(data));
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newItem));
        });
    } else if (method === 'PUT' && url.startsWith('/todos/')) {

        const id = url.split('/')[2];
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const updatedItem = JSON.parse(body);
            data = data.map(item => (item.id === id ? updatedItem : item));
            fs.writeFileSync(DATA_FILE, JSON.stringify(data));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(updatedItem));
        });
    } else if (method === 'DELETE' && url.startsWith('/todos/')) {

        const id = url.split('/')[2];
        data = data.filter(item => item.id !== id);
        fs.writeFileSync(DATA_FILE, JSON.stringify(data));
        res.writeHead(204);
        res.end();
    } else {

        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('EndPoint not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
