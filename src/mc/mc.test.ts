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
      new MultipleChoice(['a', 'b'], 3)
    }).toThrowCustomError(MultipleChoiceError, 'INVALID_INDEX')
    expect(() => {
      new MultipleChoice(['a', 'b'], -1)
    }).toThrowCustomError(MultipleChoiceError, 'INVALID_INDEX')
  })

  it('should accept valid correctChoiceIndex', () => {
    expect(() => {
      new MultipleChoice(['a', 'b'], 0)
    }).not.toThrow()
    expect(() => {
      new MultipleChoice(['a', 'b'], 1)
    }).not.toThrow()
  })
})
