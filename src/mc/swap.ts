/**
 *
 * @param original The original mc wanna to be computed the swapped versions
 * @param lockedSelectors A set of selectors that should not be swapped
 * @returns A set of mc where choices are significant swapped, while keeping the choices of locked selectors unchanged
 */

export function getSignificantSwappedMc<T extends SelectorIdType>(
  original: MultipleChoice<T>,
  lockedSelectors?: Set<T>,
): Set<MultipleChoice<T>> {
  return new Set()
}
