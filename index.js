import * as http from 'node:http'
import { URL } from 'node:url'
import { get } from './get.js'
import { set } from './set.js'
// reading data form terminal
const [portCommand, number, originCommand, baseURL] = process.argv.slice(2)
const PORT = parseInt(number, 10)
// checking data
if (portCommand !== '--port' || Number.isNaN(PORT)) {
  console.log('Invalid port number')
  console.log('Usage: node index.js --port <number> --origin <url>')
  process.exit(1)
}
if (originCommand !== '--origin' || typeof baseURL !== 'string') {
  console.log('Invalid origin url')
  console.log('Usage: node index.js --port <number> --origin <url>')
  process.exit(1)
}
// creating proxy server
const server = http.createServer((req, res) => {
  const targetUrl = new URL(req.url, baseURL)
  const cacheResponse = get(targetUrl.href)
  if (cacheResponse) {
    console.log('Cache hit')
    console.log('typeof cacheResponse', typeof cacheResponse)
    console.log('cacheResponse', cacheResponse)
    res.writeHead(200, {
      ...cacheResponse.headers,
      'X-Cache': 'HIT'
    })

    const content = cacheResponse.body.toString('utf-8')
    res.end(content)
    return
  }
  const options = {
    hostname: targetUrl.hostname,
    method: req.method,
    path: targetUrl.pathname + targetUrl.search,
    headers: req.headers,
    port: targetUrl.port
  }
  // sending request to real server
  const requestToRealServer = http.request(options, (realServerResponse) => {
    const chunks = []
    realServerResponse.on('data', (chunk) => {
      chunks.push(chunk)
      console.log('Data received from real server')
    })
    realServerResponse.on('end', () => {
      const body = Buffer.concat(chunks)
      // console.log(realServerResponse.headers['content-type'])
      set(targetUrl.href, {
        headers: realServerResponse.headers,
        body
      })
      console.log('headers from real server:')
      console.log('headers:', realServerResponse.headers)
      res.writeHead(realServerResponse.statusCode, {
        ...realServerResponse.headers,
        'X-Cache': 'MISS'
      })

      res.end(Buffer.from(body))
    })
  })
  // error handling
  requestToRealServer.on('error', (e) => {
    console.log('Problem with request to real server: ')
    console.log(e.message)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Problem with request to real server', url: targetUrl.href }))
  })

  req.pipe(requestToRealServer)
})

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
