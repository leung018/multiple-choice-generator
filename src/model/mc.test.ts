import { MultipleChoiceError, MultipleChoice } from './mc'
import { expect } from '@jest/globals'
import '../test_utils/assert/check_error'

describe('MultipleChoice', () => {
  it('should reject duplicate choices', () => {
    expect(() => {
      MultipleChoice.createTestInstance({
        choices: ['a', 'a'],
      })
    }).toThrowCustomError(MultipleChoiceError, 'DUPLICATE_CHOICES')
  })

  it('should reject invalid correctChoiceIndex', () => {
    expect(() => {
      new MultipleChoice({ choices: ['a', 'b'], correctChoiceIndex: 3 })
    }).toThrowCustomError(MultipleChoiceError, 'INVALID_INDEX')
    expect(() => {
      new MultipleChoice({ choices: ['a', 'b'], correctChoiceIndex: -1 })
    }).toThrowCustomError(MultipleChoiceError, 'INVALID_INDEX')
  })

  it('should accept valid correctChoiceIndex', () => {
    expect(() => {
      new MultipleChoice({ choices: ['a', 'b'], correctChoiceIndex: 0 })
    }).not.toThrow()
    expect(() => {
      new MultipleChoice({ choices: ['a', 'b'], correctChoiceIndex: 1 })
    }).not.toThrow()
  })

  it('should set choices and correctChoiceIndex', () => {
    const mc = new MultipleChoice({
      choices: ['a', 'b'],
      correctChoiceIndex: 1,
    })
    expect(mc.choices).toEqual(['a', 'b'])
    expect(mc.correctChoiceIndex).toBe(1)
  })

  it('should reject number of choices less than 2', () => {
    expect(() => {
      MultipleChoice.createTestInstance({ choices: ['a'] })
    }).toThrowCustomError(MultipleChoiceError, 'INVALID_NUMBER_OF_CHOICES')
  })
})
