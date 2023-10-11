import { MultipleChoice, MultipleChoiceError } from './mc'
import { expect } from '@jest/globals'
import '../test_utils/assert/check_error'

describe('MultipleChoice', () => {
  it('should reject duplicate choices', () => {
    expect(() => {
      new MultipleChoice(['a', 'a'], 0)
    }).toThrowCustomError(MultipleChoiceError, 'DUPLICATE_CHOICES')
  })
})
