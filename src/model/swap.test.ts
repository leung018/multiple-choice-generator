import { MultipleChoiceSwapper } from './swap'
import { NewVersionMultipleChoice, MultipleChoiceBuilder } from './mc'

describe('MultipleChoiceSwapper.getSignificantlySwapped', () => {
  let presetIndexBuilder: MultipleChoiceBuilder

  beforeEach(() => {
    presetIndexBuilder = new MultipleChoiceBuilder().setCorrectChoiceIndex(0)
  })

  it('should compute swaps for two choices', () => {
    const mc = new NewVersionMultipleChoice({
      choices: [
        { answer: 'a', isFixedPosition: false },
        { answer: 'b', isFixedPosition: false },
      ],
      correctChoiceIndex: 0,
    })
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([
        new NewVersionMultipleChoice({
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
    const mc = new NewVersionMultipleChoice({
      choices: [
        { answer: 'a', isFixedPosition: false },
        { answer: 'b', isFixedPosition: false },
        { answer: 'c', isFixedPosition: false },
      ],
      correctChoiceIndex: 1,
    })
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([
        new NewVersionMultipleChoice({
          choices: [
            { answer: 'b', isFixedPosition: false },
            { answer: 'c', isFixedPosition: false },
            { answer: 'a', isFixedPosition: false },
          ],
          correctChoiceIndex: 0,
        }),
        new NewVersionMultipleChoice({
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

  it('should return same set when all choices are fixed', () => {
    const mc = presetIndexBuilder
      .addFixedChoice('a')
      .addFixedChoice('b')
      .addFixedChoice('c')
      .build()
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([mc]),
    )
  })

  it('should return same set when all choices are fixed except one', () => {
    const mc = presetIndexBuilder
      .addFixedChoice('a')
      .addFixedChoice('b')
      .addNonFixedChoice('c')
      .build()
    expect(MultipleChoiceSwapper.getSignificantlySwapped(mc)).toEqual(
      new Set([mc]),
    )
  })
})
