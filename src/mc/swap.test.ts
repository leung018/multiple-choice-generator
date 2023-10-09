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
})
