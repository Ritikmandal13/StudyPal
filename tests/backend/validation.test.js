const { sanitizeFilename, validateFileSize, validateMimeType } = require('../../backend/src/utils/validation')

describe('validation utils', () => {
  it('sanitizes filename', () => {
    expect(sanitizeFilename('../evil.pdf')).toBe('evil.pdf')
    expect(sanitizeFilename('folder/ok.pdf')).toBe('ok.pdf')
  })

  it('validates size', () => {
    expect(validateFileSize(5 * 1024 * 1024)).toBe(true)
    expect(validateFileSize(11 * 1024 * 1024)).toBe(false)
  })

  it('validates mime', () => {
    expect(validateMimeType('application/pdf')).toBe(true)
    expect(validateMimeType('text/plain')).toBe(false)
  })
})

