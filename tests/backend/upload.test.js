const request = require('supertest')
const path = require('path')
const app = require('../../backend/src/server')

describe('POST /api/upload', () => {
  it('rejects missing file', async () => {
    const res = await request(app).post('/api/upload')
    expect(res.statusCode).toBe(400)
  })

  it('rejects non-pdf', async () => {
    const res = await request(app)
      .post('/api/upload')
      .attach('pdf', Buffer.from('not a pdf'), 'test.txt')
    expect(res.statusCode).toBe(400)
  })
})

