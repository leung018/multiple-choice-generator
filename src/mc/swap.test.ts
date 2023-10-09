import { MultipleChoiceSwapper } from './swap'
import { MultipleChoice } from './mc'

describe('MultipleChoiceSwapper.getSignificantlySwapped', () => {
  it('should compute swaps for two choices', () => {
    const mc = new MultipleChoice(['a', 'b'], 0)
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([new MultipleChoice(['b', 'a'], 1)]),
    )
  })

  it('should compute swaps for three choices', () => {
    const mc = new MultipleChoice(['a', 'b', 'c'], 1)
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([
        new MultipleChoice(['b', 'c', 'a'], 0),
        new MultipleChoice(['c', 'a', 'b'], 2),
      ]),
    )
  })

  it('should further limit output when lockedChoiceIndices have one element', () => {
    const mc = new MultipleChoice(
      ['Apple only', 'Banana only', 'None of the above'],
      1,
    )
    const lockedChoiceIndices = new Set([2])
    expect(
      MultipleChoiceSwapper.getSignificantlySwapped(mc, lockedChoiceIndices),
    ).toEqual(
      new Set([
        new MultipleChoice(
          ['Banana only', 'Apple only', 'None of the above'],
          0,
        ),
      ]),
    )
  })

  it('should ignore lockedChoiceIndices when they are out of range', () => {
    const mc = new MultipleChoice(['a', 'b'], 1)
    const lockedChoiceIndices = new Set([2])
    expect(
      MultipleChoiceSwapper.getSignificantlySwapped(mc, lockedChoiceIndices),
    ).toEqual(new Set([new MultipleChoice(['b', 'a'], 0)]))
  })

  it('should return same set when lockedChoiceIndices contain all choices', () => {
    const mc = new MultipleChoice(['a', 'b', 'c'], 2)
    const lockedChoiceIndices = new Set([0, 1, 2])
    expect(
      MultipleChoiceSwapper.getSignificantlySwapped(mc, lockedChoiceIndices),
    ).toEqual(new Set([mc]))
  })

  it('should return empty set when lockedChoiceIndices contain all choices except one', () => {
    const mc = new MultipleChoice(['a', 'b', 'c'], 0)
    const lockedChoiceIndices = new Set([0, 1])
    expect(
      MultipleChoiceSwapper.getSignificantlySwapped(mc, lockedChoiceIndices),
    ).toEqual(new Set())
  })
})
