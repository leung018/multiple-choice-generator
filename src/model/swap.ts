import { getPermutations } from '../utils/permutation'
import { NewVersionMultipleChoice, Choice } from './mc'

export class MultipleChoiceSwapper {
  /**
   * Computes a set of MultipleChoice objects where the choices are significantly swapped.
   * Significantly swapped means that each choice is in a different position from the original MultipleChoice object,
   * except for those choices that are fixed position and should not be swapped.
   *
   * @returns A set of MultipleChoice objects where the choices are significantly swapped.
   */
  static getSignificantlySwapped(
    originalMc: NewVersionMultipleChoice,
  ): Set<NewVersionMultipleChoice> {
    return new MultipleChoiceSwapper(originalMc).getSignificantlySwapped()
  }

  private readonly originalChoices: ReadonlyArray<Choice>
  private readonly correctChoice: Choice

  private constructor(originalMc: NewVersionMultipleChoice) {
    this.originalChoices = originalMc.choices
    this.correctChoice = originalMc.choices[originalMc.correctChoiceIndex]
  }

  private getSignificantlySwapped(): Set<NewVersionMultipleChoice> {
    const allPossibleChoices = getPermutations(this.originalChoices)
    const significantSwappedChoices = Array.from(allPossibleChoices).filter(
      this.areSignificantlySwapped,
    )
    return new Set(significantSwappedChoices.map(this.mapToMc))
  }

  private areSignificantlySwapped = (
    newChoices: ReadonlyArray<Choice>,
  ): boolean => {
    for (let i = 0; i < newChoices.length; i++) {
      const newChoice = newChoices[i]
      if (newChoice.isFixedPosition && this.isChoiceMoved(newChoice, i)) {
        return false
      }
      if (!newChoice.isFixedPosition && this.isChoiceStayed(newChoice, i)) {
        return false
      }
    }
    return true
  }

  private isChoiceMoved = (newChoice: Choice, newIndex: number): boolean => {
    return newChoice !== this.originalChoices[newIndex]
  }

  private isChoiceStayed = (newChoice: Choice, newIndex: number): boolean => {
    return newChoice === this.originalChoices[newIndex]
  }

  private mapToMc = (
    choices: ReadonlyArray<Choice>,
  ): NewVersionMultipleChoice => {
    const correctChoiceIndex = choices.findIndex(
      (c) => c === this.correctChoice,
    )
    return new NewVersionMultipleChoice({ choices, correctChoiceIndex })
  }
}
