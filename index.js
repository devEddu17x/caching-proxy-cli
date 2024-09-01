import * as http from 'node:http'
import { URL } from 'node:url';
// reading data form terminal
const [portCommand, number, originCommand, baseURL] = process.argv.slice(2);
const PORT = parseInt(number, 10);
// validate data
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
    res.writeHead(200, {'Content-Type': 'application/json'});
    /**
    
    
    const requestToRealServer = http.request({
        url: targetUrl.host,
        method: req.method,
        headers: req.headers,
        port: targetUrl.port
    }, (proxyResponse) => {
        res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
        proxyResponse.pipe(res);
    }
)
*/
    res.end(JSON.stringify( {
        message: 'Request has been received from proxy server',
        method: req.method,
        targetUrl: targetUrl.href,
        }));
})      

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);           
})          