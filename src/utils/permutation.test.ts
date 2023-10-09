import { getPermutations } from './permutation'

describe('getPermutations', () => {
  it('should return empty set for empty list input', () => {
    expect(getPermutations([])).toEqual(new Set())
  })

  it('should return single set for single element list input', () => {
    expect(getPermutations([1])).toEqual(new Set([[1]]))
  })

  it('should return permutations for multiple element list input', () => {
    expect(getPermutations([1, 2])).toEqual(
      new Set([
        [1, 2],
        [2, 1],
      ]),
    )
    expect(getPermutations([1, 2, 3])).toEqual(
      new Set([
        [1, 2, 3],
        [1, 3, 2],
        [2, 1, 3],
        [2, 3, 1],
        [3, 1, 2],
        [3, 2, 1],
      ]),
    )
  })
})
