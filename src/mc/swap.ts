import { getPermutations } from '../utils/permutation'
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
  return new MultipleChoiceSwapper(
    originalMc,
    lockedChoices,
  ).getSignificantSwappedMc()
}

class MultipleChoiceSwapper {
  private readonly originalChoices: ReadonlyArray<string>
  private readonly correctChoice: string

  constructor(originalMc: MultipleChoice, lockedChoices?: Set<number>) {
    this.originalChoices = originalMc.choices
    this.correctChoice = originalMc.choices[originalMc.correctIndex]
  }

  getSignificantSwappedMc(): Set<MultipleChoice> {
    const allPossibleChoices = getPermutations(this.originalChoices)
    const significantSwappedChoices = Array.from(allPossibleChoices).filter(
      this.areSignificantlySwapped,
    )
    return new Set(significantSwappedChoices.map(this.mapToMc))
  }

  private areSignificantlySwapped = (
    choices: ReadonlyArray<string>,
  ): boolean => {
    for (let i = 0; i < choices.length; i++) {
      if (choices[i] === this.originalChoices[i]) return false
    }
    return true
  }

  private mapToMc = (choices: ReadonlyArray<string>): MultipleChoice => {
    const correctChoiceIndex = choices.findIndex(
      (c) => c === this.correctChoice,
    )
    return new MultipleChoice(choices, correctChoiceIndex)
  }
}
