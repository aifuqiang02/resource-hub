import { describe, expect, it } from 'vitest'
import { appEnv } from './env'

describe('appEnv', () => {
  it('returns normalized app env values', () => {
    expect(appEnv.appTitle).toBeTypeOf('string')
    expect(appEnv.apiBaseUrl.length).toBeGreaterThan(0)
    expect(appEnv.requestTimeout).toBeGreaterThan(0)
    expect(typeof appEnv.enableMock).toBe('boolean')
  })
})
