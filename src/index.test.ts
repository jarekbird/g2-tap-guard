import { describe, expect, it } from 'vitest'
import { tapGuard } from './index'

const WINDOW = 1_500

const setup = () => {
  let t = 10_000
  const guard = tapGuard({ windowMs: WINDOW, now: () => t })
  return { guard, advance: (ms: number) => void (t += ms) }
}

describe('tapGuard', () => {
  it('lets a tap through when nothing scrolled', () => {
    expect(setup().guard.stray()).toBeNull()
  })
  it('calls a tap within the window after a scroll stray, with the time since the scroll', () => {
    const { guard, advance } = setup()
    guard.scrolled()
    advance(WINDOW - 1)
    expect(guard.stray()).toEqual({ sinceMs: WINDOW - 1, run: 1 })
  })
  it('lets a tap through once the window has passed', () => {
    const { guard, advance } = setup()
    guard.scrolled()
    advance(WINDOW)
    expect(guard.stray()).toBeNull()
  })
  it('measures from the latest scroll', () => {
    const { guard, advance } = setup()
    guard.scrolled()
    advance(1_000)
    guard.scrolled()
    advance(1_000)
    expect(guard.stray()).toEqual({ sinceMs: 1_000, run: 1 })
  })
  it('keeps the window open through a run of stray taps, counting them', () => {
    const { guard, advance } = setup()
    guard.scrolled()
    const runs = [720, 690, 632, 990].map(ms => (advance(ms), guard.stray()))
    expect(runs).toEqual([
      { sinceMs: 720, run: 1 },
      { sinceMs: 690, run: 2 },
      { sinceMs: 632, run: 3 },
      { sinceMs: 990, run: 4 },
    ])
  })
  it('lets the next tap through once a tap got through, until the next scroll', () => {
    const { guard, advance } = setup()
    guard.scrolled()
    advance(WINDOW)
    expect(guard.stray()).toBeNull()
    advance(10)
    expect(guard.stray()).toBeNull()
    guard.scrolled()
    advance(10)
    expect(guard.stray()).toEqual({ sinceMs: 10, run: 1 })
  })
  it('lets a tap through when the clock went backwards', () => {
    const { guard, advance } = setup()
    guard.scrolled()
    advance(-5)
    expect(guard.stray()).toBeNull()
  })
})
