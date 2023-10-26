import { MultipleChoiceSwapper } from './swap'
import { MultipleChoice, NewVersionMultipleChoice } from './mc'

describe('MultipleChoiceSwapper.getSignificantlySwapped', () => {
  it('should compute swaps for two choices', () => {
    const mc = NewVersionMultipleChoice.createWithNoFixedChoices({
      answers: ['a', 'b'],
      correctAnswerIndex: 0,
    })
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([
        NewVersionMultipleChoice.createWithNoFixedChoices({
          answers: ['b', 'a'],
          correctAnswerIndex: 1,
        }),
      ]),
    )
  })

  it('should compute swaps for three choices', () => {
    const mc = NewVersionMultipleChoice.createWithNoFixedChoices({
      answers: ['a', 'b', 'c'],
      correctAnswerIndex: 1,
    })
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([
        NewVersionMultipleChoice.createWithNoFixedChoices({
          answers: ['b', 'c', 'a'],
          correctAnswerIndex: 0,
        }),
        NewVersionMultipleChoice.createWithNoFixedChoices({
          answers: ['c', 'a', 'b'],
          correctAnswerIndex: 2,
        }),
      ]),
    )
  })

  it('should further limit output when one choice is fixed position', () => {
    const mc = new NewVersionMultipleChoice({
      choices: [
        { answer: 'Apple only', isFixedPosition: false },
        { answer: 'Banana only', isFixedPosition: false },
        { answer: 'None of the above', isFixedPosition: true },
      ],
      correctChoiceIndex: 1,
    })
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([
        new NewVersionMultipleChoice({
          choices: [
            { answer: 'Banana only', isFixedPosition: false },
            { answer: 'Apple only', isFixedPosition: false },
            { answer: 'None of the above', isFixedPosition: true },
          ],
          correctChoiceIndex: 0,
        }),
      ]),
    )
  })

  it('should return same set when lockedChoiceIndices contain all choices', () => {
    const mc = NewVersionMultipleChoice.createTestInstance({
      choices: [
        { answer: 'a', isFixedPosition: true },
        { answer: 'b', isFixedPosition: true },
        { answer: 'c', isFixedPosition: true },
      ],
    })
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([mc]),
    )
  })

  it('should return same set when lockedChoiceIndices contain all choices except one', () => {
    const mc = NewVersionMultipleChoice.createTestInstance({
      choices: [
        { answer: 'a', isFixedPosition: true },
        { answer: 'b', isFixedPosition: true },
        { answer: 'c', isFixedPosition: false },
      ],
    })
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([mc]),
    )
  })
})
