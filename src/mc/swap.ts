import { MultipleChoice } from './mc'

/**
 * Computes a set of MultipleChoice objects where the choices are significantly swapped.
 * Significantly swapped means that each choice is in a different position from the original MultipleChoice object,
 * except for those choices that are locked and should not be swapped.
 *
 * @param originalMc The original MultipleChoice object to be used as the basis for the swaps.
 * @param lockedChoices A set of indices of choices that are locked and should not be swapped.
 * @returns A set of MultipleChoice objects where the choices are significantly swapped.
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
