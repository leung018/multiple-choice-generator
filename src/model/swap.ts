import { getPermutations } from '../utils/permutation'
import { MultipleChoice } from './mc'

export class MultipleChoiceSwapper {
  /**
   * Computes a set of MultipleChoice objects where the choices are significantly swapped.
   * Significantly swapped means that each choice is in a different position from the original MultipleChoice object,
   * except for those choices that are locked and should not be swapped.
   *
   * @param originalMc The original MultipleChoice object to be used as the basis for the swaps.
   * @param lockedChoiceIndices A set of indices of choices that are locked and should not be swapped.
   * @returns A set of MultipleChoice objects where the choices are significantly swapped.
   */
  static getSignificantlySwapped(
    originalMc: MultipleChoice,
    lockedChoiceIndices: ReadonlySet<number> = new Set(),
  ): Set<MultipleChoice> {
    return new MultipleChoiceSwapper(
      originalMc,
      lockedChoiceIndices,
    ).getSignificantlySwapped()
  }

  private readonly originalChoices: ReadonlyArray<string>
  private readonly lockedChoiceToOriginalIndexMap: ReadonlyMap<string, number>
  private readonly correctChoice: string

  private constructor(
    originalMc: MultipleChoice,
    lockedChoiceIndices: ReadonlySet<number>,
  ) {
    this.originalChoices = originalMc.choices
    this.correctChoice = originalMc.choices[originalMc.correctChoiceIndex]
    this.lockedChoiceToOriginalIndexMap = this.chosenChoicesToIndexMap(
      lockedChoiceIndices,
      this.originalChoices,
    )
  }

  private chosenChoicesToIndexMap(
    chosenIndices: ReadonlySet<number>,
    choices: ReadonlyArray<string>,
  ): ReadonlyMap<string, number> {
    const map = new Map<string, number>()
    chosenIndices.forEach((index) => {
      map.set(choices[index], index)
    })
    return map
  }

  private getSignificantlySwapped(): Set<MultipleChoice> {
    const allPossibleChoices = getPermutations(this.originalChoices)
    const significantSwappedChoices = Array.from(allPossibleChoices).filter(
      this.areSignificantlySwapped,
    )
    return new Set(significantSwappedChoices.map(this.mapToMc))
  }

  private areSignificantlySwapped = (
    newChoices: ReadonlyArray<string>,
  ): boolean => {
    for (let i = 0; i < newChoices.length; i++) {
      const newChoice = newChoices[i]
      if (this.lockedChoiceToOriginalIndexMap.has(newChoice)) {
        if (this.lockedChoiceToOriginalIndexMap.get(newChoice) != i) {
          return false
        } else {
          continue
        }
      }
      if (newChoice === this.originalChoices[i]) return false
    }
    return true
  }

  private mapToMc = (choices: ReadonlyArray<string>): MultipleChoice => {
    const correctChoiceIndex = choices.findIndex(
      (c) => c === this.correctChoice,
    )
    return new MultipleChoice({ choices, correctChoiceIndex })
  }
}
