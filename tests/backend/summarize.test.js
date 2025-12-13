const request = require('supertest')
const app = require('../../backend/src/server')
const storage = require('../../backend/src/utils/storage')

jest.mock('../../backend/src/utils/storage')

describe('POST /api/summarize', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('requires jobId', async () => {
    const res = await request(app).post('/api/summarize').send({})
    expect(res.statusCode).toBe(400)
  })

  it('returns 404 when job missing', async () => {
    storage.getJob.mockResolvedValue(null)
    const res = await request(app).post('/api/summarize').send({ jobId: 'x' })
    expect(res.statusCode).toBe(404)
  })
})

