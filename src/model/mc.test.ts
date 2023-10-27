import {
  MultipleChoiceError,
  MultipleChoiceBuilder,
  NewVersionMultipleChoice,
} from './mc'
import { expect } from '@jest/globals'
import '../test_utils/assert/check_error'

describe('MultipleChoice', () => {
  let presetIndexBuilder: MultipleChoiceBuilder

  beforeEach(() => {
    presetIndexBuilder = new MultipleChoiceBuilder().setCorrectChoiceIndex(0)
  })

  it('should set choices and correctChoiceIndex', () => {
    const mc = new NewVersionMultipleChoice({
      choices: [
        { answer: 'a', isFixedPosition: false },
        { answer: 'b', isFixedPosition: false },
        { answer: 'All of the above', isFixedPosition: true },
        { answer: 'None of the above', isFixedPosition: true },
      ],
      correctChoiceIndex: 1,
    })
    expect(mc.choices).toEqual([
      { answer: 'a', isFixedPosition: false },
      { answer: 'b', isFixedPosition: false },
      { answer: 'All of the above', isFixedPosition: true },
      { answer: 'None of the above', isFixedPosition: true },
    ])
    expect(mc.correctChoiceIndex).toBe(1)

    // expect builder can do the same thing
    const builder = new MultipleChoiceBuilder()
      .addNonFixedChoice('a')
      .addNonFixedChoice('b')
      .addFixedChoice('All of the above')
      .addChoice({ answer: 'None of the above', isFixedPosition: true })
      .setCorrectChoiceIndex(1)
    expect(builder.build()).toEqual(mc)
  })

  it('should reject invalid correctChoiceIndex', () => {
    presetIndexBuilder.addFixedChoice('a').addFixedChoice('b')
    expect(() => {
      presetIndexBuilder.setCorrectChoiceIndex(3).build()
    }).toThrowCustomError(MultipleChoiceError, 'INVALID_INDEX')
    expect(() => {
      presetIndexBuilder.setCorrectChoiceIndex(-1).build()
    }).toThrowCustomError(MultipleChoiceError, 'INVALID_INDEX')

    // using builder without setting correctChoiceIndex should throw
    expect(() => {
      new MultipleChoiceBuilder()
        .addFixedChoice('a')
        .addFixedChoice('b')
        .build()
    }).toThrowCustomError(MultipleChoiceError, 'INVALID_INDEX')
  })

  it('should reject duplicate answers', () => {
    expect(() => {
      presetIndexBuilder.addFixedChoice('a').addNonFixedChoice('a').build()
    }).toThrowCustomError(MultipleChoiceError, 'DUPLICATE_CHOICES')
  })

  it('should accept valid correctChoiceIndex', () => {
    const builder = new MultipleChoiceBuilder()
      .addFixedChoice('a')
      .addFixedChoice('b')
    expect(() => {
      builder.setCorrectChoiceIndex(0).build()
    }).not.toThrow()
    expect(() => {
      builder.setCorrectChoiceIndex(1).build()
    }).not.toThrow()
  })

  it('should reject number of choices less than 2', () => {
    expect(() => {
      presetIndexBuilder.addFixedChoice('a').build()
    }).toThrowCustomError(MultipleChoiceError, 'INVALID_NUMBER_OF_CHOICES')
  })
})
