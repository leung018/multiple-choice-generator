import { getSignificantSwappedMc } from './swap'
import { MultipleChoice } from './mc'

describe('getSignificantSwappedMc', () => {
  it('compute swaps for two choices', () => {
    const mc = new MultipleChoice(['a', 'b'], 0)
    expect(getSignificantSwappedMc(mc)).toEqual(
      new Set([new MultipleChoice(['b', 'a'], 1)]),
    )
  })

  it('compute swaps for three choices', () => {
    const mc = new MultipleChoice(['a', 'b', 'c'], 1)
    expect(getSignificantSwappedMc(mc)).toEqual(
      new Set([
        new MultipleChoice(['b', 'c', 'a'], 0),
        new MultipleChoice(['c', 'a', 'b'], 2),
      ]),
    )
  })
})
