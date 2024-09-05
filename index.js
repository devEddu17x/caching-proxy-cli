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
    res.writeHead(200, {
      ...cacheResponse.headers,
      'X-Cache': 'HIT'
    })
    res.end(JSON.stringify(cacheResponse))
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
    const contentType = realServerResponse.headers['content-type']

    realServerResponse.on('data', (chunk) => {
      chunks.push(chunk)
    })

    realServerResponse.on('end', () => {
      let body = Buffer.concat(chunks)

      if (contentType && contentType.includes('application/json')) {
        try {
          body = JSON.parse(body.toString())
        } catch (e) {
          console.log('Error parsing JSON', e)
        }
      } else if (contentType && contentType.startsWith('text/')) {
        body = body.toString()
      }

      set(targetUrl.href, {
        headers: realServerResponse.headers,
        body
      })

      res.writeHead(realServerResponse.statusCode, {
        ...realServerResponse.headers,
        'X-Cache': 'MISS'
      })

      res.end(typeof body === 'string' ? body : Buffer.from(body))
    })
  })
  // error handling
  requestToRealServer.on('error', (e) => {
    console.log('Problem with request to real server: ', e.message)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Problem with request to real server', url: targetUrl.href }))
  })

  req.pipe(requestToRealServer)
})

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
