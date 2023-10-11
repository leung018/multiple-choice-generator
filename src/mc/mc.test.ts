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
})
