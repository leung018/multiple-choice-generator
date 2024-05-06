import { SetRandomDrawer } from './random_draw'

describe('SetRandomDraw', () => {
  it('should raise error if empty set is passed', () => {
    const setRandomDrawer = SetRandomDrawer.createNull()
    expect(() => setRandomDrawer.draw(new Set())).toThrow()
  })

  it('should draw properly when random return 0', () => {
    const random = () => 0
    const setRandomDrawer = SetRandomDrawer.createNull({ random })
    expect(setRandomDrawer.draw(new Set([1, 2, 3]))).toBe(1)
  })

  it('should draw properly when random return sth between 0 and 1', () => {
    const random = () => 0.5
    const setRandomDrawer = SetRandomDrawer.createNull({ random })
    expect(setRandomDrawer.draw(new Set([1, 2, 3]))).toBe(2)
  })

  it('should draw properly when random return slightly less than 1', () => {
    const random = () => 0.99999999
    const setRandomDrawer = SetRandomDrawer.createNull({ random })
    expect(setRandomDrawer.draw(new Set([1, 2, 3]))).toBe(3)
  })
})
