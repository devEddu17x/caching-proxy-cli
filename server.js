import * as http from 'node:http'

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    message: 'Request has been received from real server',
    method: req.method,
    'url-in-real-server': req.url
  }))
})

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
