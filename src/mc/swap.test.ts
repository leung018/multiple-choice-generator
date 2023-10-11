import { MultipleChoiceSwapper } from './swap'
import { MultipleChoice } from './mc'

describe('MultipleChoiceSwapper.getSignificantlySwapped', () => {
  it('should compute swaps for two choices', () => {
    const mc = new MultipleChoice({
      choices: ['a', 'b'],
      correctChoiceIndex: 0,
    })
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([
        new MultipleChoice({ choices: ['b', 'a'], correctChoiceIndex: 1 }),
      ]),
    )
  })

  it('should compute swaps for three choices', () => {
    const mc = new MultipleChoice({
      choices: ['a', 'b', 'c'],
      correctChoiceIndex: 1,
    })
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([
        new MultipleChoice({ choices: ['b', 'c', 'a'], correctChoiceIndex: 0 }),
        new MultipleChoice({ choices: ['c', 'a', 'b'], correctChoiceIndex: 2 }),
      ]),
    )
  })

  it('should further limit output when lockedChoiceIndices have one element', () => {
    const mc = new MultipleChoice({
      choices: ['Apple only', 'Banana only', 'None of the above'],
      correctChoiceIndex: 1,
    })
    const lockedChoiceIndices = new Set([2])
    expect(
      MultipleChoiceSwapper.getSignificantlySwapped(mc, lockedChoiceIndices),
    ).toEqual(
      new Set([
        new MultipleChoice({
          choices: ['Banana only', 'Apple only', 'None of the above'],
          correctChoiceIndex: 0,
        }),
      ]),
    )
  })

  it('should ignore lockedChoiceIndices when they are out of range', () => {
    const mc = new MultipleChoice({
      choices: ['a', 'b'],
      correctChoiceIndex: 1,
    })
    const lockedChoiceIndices = new Set([2])
    expect(
      MultipleChoiceSwapper.getSignificantlySwapped(mc, lockedChoiceIndices),
    ).toEqual(
      new Set([
        new MultipleChoice({ choices: ['b', 'a'], correctChoiceIndex: 0 }),
      ]),
    )
  })

  it('should return same set when lockedChoiceIndices contain all choices', () => {
    const mc = MultipleChoice.createTestInstance({
      choices: ['a', 'b', 'c'],
    })
    const lockedChoiceIndices = new Set([0, 1, 2])
    expect(
      MultipleChoiceSwapper.getSignificantlySwapped(mc, lockedChoiceIndices),
    ).toEqual(new Set([mc]))
  })

  it('should return empty set when lockedChoiceIndices contain all choices except one', () => {
    const mc = MultipleChoice.createTestInstance({
      choices: ['a', 'b', 'c'],
    })
    const lockedChoiceIndices = new Set([0, 1])
    expect(
      MultipleChoiceSwapper.getSignificantlySwapped(mc, lockedChoiceIndices),
    ).toEqual(new Set())
  })
})
