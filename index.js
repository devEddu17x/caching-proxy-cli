import * as http from 'node:http'
import { URL } from 'node:url';
// reading data form terminal
const [portCommand, number, originCommand, baseURL] = process.argv.slice(2);
const PORT = parseInt(number, 10);
// checking data
if (portCommand !== '--port' || Number.isNaN(PORT)) {
    console.log('Invalid port number');
    console.log('Usage: node index.js --port <number> --origin <url>');
    process.exit(1);
}
if (originCommand !== '--origin' || typeof baseURL !== 'string') {
    console.log('Invalid origin url');
    console.log('Usage: node index.js --port <number> --origin <url>');
    process.exit(1);
}   
// creating proxy server    
const server = http.createServer((req, res) => {

    const targetUrl = new URL(req.url, baseURL);  

    const options = {
        hostname: targetUrl.hostname,
        method: req.method,
        path: targetUrl.pathname + targetUrl.search,
        headers: req.headers,
        port: targetUrl.port
    }
    // sending request to real server 
    const requestToRealServer = http.request(options, (realServerResponse) => {
        res.writeHead(realServerResponse.statusCode, realServerResponse.headers);
        realServerResponse.pipe(res);
    })
    // error handling
    requestToRealServer.on('error', (e) => {
        console.log('Problem with request to real server: ', e.message);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ message: 'Problem with request to real server', url: targetUrl.href }));    
    })
    // sending request to real server
    req.pipe(requestToRealServer);

})      

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);           
})              