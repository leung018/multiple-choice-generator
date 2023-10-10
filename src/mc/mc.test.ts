import { MultipleChoice, MultipleChoiceError } from './mc'

describe('MultipleChoice', () => {
  it('should reject duplicate choices', () => {
    try {
      new MultipleChoice(['a', 'a'], 0)
    } catch (err) {
      if (err instanceof MultipleChoiceError) {
        expect(err.cause.code).toBe('DUPLICATE_CHOICES')
      } else {
        throw new Error('Expected MultipleChoiceError')
      }
    }
  })
})
