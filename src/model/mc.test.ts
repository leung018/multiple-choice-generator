import {
  MultipleChoiceError,
  MultipleChoiceBuilder,
  MultipleChoice,
} from './mc'
import { expect } from '@jest/globals'
import '../test_utils/assert/check_error'

describe('MultipleChoice', () => {
  const presetCorrectChoiceBuilder = () => {
    return new MultipleChoiceBuilder().setCorrectChoiceIndex(0)
  }

  it('should set choices and correctChoiceIndex', () => {
    const mc = new MultipleChoice({
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
      .appendNonFixedChoice('a')
      .appendNonFixedChoice('b')
      .appendFixedChoice('All of the above')
      .appendChoice({ answer: 'None of the above', isFixedPosition: true })
      .setCorrectChoiceIndex(1)
    expect(builder.build()).toEqual(mc)
  })

  it('should reject invalid correctChoiceIndex', () => {
    const builder = new MultipleChoiceBuilder()
      .appendFixedChoice('a')
      .appendFixedChoice('b')
    expect(() => {
      builder.setCorrectChoiceIndex(3).build()
    }).toThrowCustomError(MultipleChoiceError, 'INVALID_INDEX')
    expect(() => {
      builder.setCorrectChoiceIndex(-1).build()
    }).toThrowCustomError(MultipleChoiceError, 'INVALID_INDEX')

    // using builder without setting correctChoiceIndex should throw
    expect(() => {
      new MultipleChoiceBuilder()
        .appendFixedChoice('a')
        .appendFixedChoice('b')
        .build()
    }).toThrowCustomError(MultipleChoiceError, 'INVALID_INDEX')
  })

  it('should reject duplicate answers', () => {
    expect(() => {
      presetCorrectChoiceBuilder()
        .appendFixedChoice('a')
        .appendNonFixedChoice('a')
        .build()
    }).toThrowCustomError(MultipleChoiceError, 'DUPLICATE_CHOICES')
  })

  it('should accept valid correctChoiceIndex', () => {
    const builder = new MultipleChoiceBuilder()
      .appendFixedChoice('a')
      .appendFixedChoice('b')
    expect(() => {
      builder.setCorrectChoiceIndex(0).build()
    }).not.toThrow()
    expect(() => {
      builder.setCorrectChoiceIndex(1).build()
    }).not.toThrow()
  })

  it('should reject number of choices less than 2', () => {
    expect(() => {
      presetCorrectChoiceBuilder().appendFixedChoice('a').build()
    }).toThrowCustomError(MultipleChoiceError, 'INVALID_NUMBER_OF_CHOICES')
  })
})
