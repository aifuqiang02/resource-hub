import { describe, expect, it } from 'vitest'
import { hasPermission } from './has-permission'

describe('hasPermission', () => {
  it('returns true when there is no required role', () => {
    expect(hasPermission(['editor'], undefined)).toBe(true)
  })

  it('returns true when user contains one of required roles', () => {
    expect(hasPermission(['editor'], ['admin', 'editor'])).toBe(true)
  })

  it('returns false when user has no required role', () => {
    expect(hasPermission(['viewer'], ['admin'])).toBe(false)
  })
})
