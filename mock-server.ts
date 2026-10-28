import { createServer } from 'node:http'
import { handler } from './mocks/handler.ts'

const PORT = process.env.MOCK_PORT ? Number(process.env.MOCK_PORT) : 8787

const server = createServer((req, res) => {
  handler(req, res, () => {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Not Found' }))
  })
})

server.listen(PORT, () => {
  console.log(`Mock API corriendo en http://localhost:${PORT}`)
})
