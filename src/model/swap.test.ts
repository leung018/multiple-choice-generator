import { MultipleChoiceSwapper } from './swap'
import { MultipleChoice, MultipleChoiceBuilder } from './mc'

describe('MultipleChoiceSwapper.getSignificantlySwapped', () => {
  const presetCorrectChoiceBuilder = () => {
    return new MultipleChoiceBuilder().setCorrectChoiceIndex(0)
  }

  it('should compute swaps for two choices', () => {
    const mc = new MultipleChoice({
      choices: [
        { answer: 'a', isFixedPosition: false },
        { answer: 'b', isFixedPosition: false },
      ],
      correctChoiceIndex: 0,
    })
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([
        new MultipleChoice({
          choices: [
            { answer: 'b', isFixedPosition: false },
            { answer: 'a', isFixedPosition: false },
          ],
          correctChoiceIndex: 1,
        }),
      ]),
    )
  })

  it('should compute swaps for three choices', () => {
    const mc = new MultipleChoice({
      choices: [
        { answer: 'a', isFixedPosition: false },
        { answer: 'b', isFixedPosition: false },
        { answer: 'c', isFixedPosition: false },
      ],
      correctChoiceIndex: 1,
    })
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([
        new MultipleChoice({
          choices: [
            { answer: 'b', isFixedPosition: false },
            { answer: 'c', isFixedPosition: false },
            { answer: 'a', isFixedPosition: false },
          ],
          correctChoiceIndex: 0,
        }),
        new MultipleChoice({
          choices: [
            { answer: 'c', isFixedPosition: false },
            { answer: 'a', isFixedPosition: false },
            { answer: 'b', isFixedPosition: false },
          ],
          correctChoiceIndex: 2,
        }),
      ]),
    )
  })

  it('should further limit output when one choice is fixed position', () => {
    const mc = new MultipleChoice({
      choices: [
        { answer: 'Apple only', isFixedPosition: false },
        { answer: 'Banana only', isFixedPosition: false },
        { answer: 'None of the above', isFixedPosition: true },
      ],
      correctChoiceIndex: 1,
    })
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([
        new MultipleChoice({
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

  it('should return same set when all choices are fixed', () => {
    const mc = presetCorrectChoiceBuilder()
      .appendFixedChoice('a')
      .appendFixedChoice('b')
      .appendFixedChoice('c')
      .build()
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([mc]),
    )
  })

  it('should return same set when all choices are fixed except one', () => {
    const mc = presetCorrectChoiceBuilder()
      .appendFixedChoice('a')
      .appendFixedChoice('b')
      .appendNonFixedChoice('c')
      .build()
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([mc]),
    )
  })
})
