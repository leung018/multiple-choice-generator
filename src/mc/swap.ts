import { MultipleChoice } from './mc'

/**
 *
 * @param originalMc The original mc wanna to be computed the swapped versions
 * @param lockedChoices A set of indices of choices that are locked and should not be swapped
 * @returns A set of mc where choices are significant swapped, while keeping those in lockedChoices unchanged
 */
export function getSignificantSwappedMc(
  originalMc: MultipleChoice,
  lockedChoices?: Set<number>,
): Set<MultipleChoice> {
  return new Set([
    new MultipleChoice(
      [...originalMc.choices].reverse(),
      originalMc.correctIndex ? 0 : 1,
    ),
  ])
}
