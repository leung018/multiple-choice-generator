import { getSignificantSwappedMc } from './swap'
import { MultipleChoice } from './mc'

describe('getSignificantSwappedMc', () => {
  it('compute swaps for two choices', () => {
    const mc = new MultipleChoice(['a', 'b'], 0)
    expect(getSignificantSwappedMc(mc)).toEqual(
      new Set([new MultipleChoice(['b', 'a'], 1)]),
    )
  })
})
