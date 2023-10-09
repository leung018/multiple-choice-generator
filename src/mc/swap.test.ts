import { MultipleChoiceSwapper } from './swap'
import { MultipleChoice } from './mc'

describe('MultipleChoiceSwapper.getSignificantlySwapped', () => {
  it('compute swaps for two choices', () => {
    const mc = new MultipleChoice(['a', 'b'], 0)
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([new MultipleChoice(['b', 'a'], 1)]),
    )
  })

  it('compute swaps for three choices', () => {
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
})
