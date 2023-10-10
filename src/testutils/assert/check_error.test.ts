import { CustomBaseError } from '../../utils/err'
import { expect } from '@jest/globals'
import './check_error'

class TestError extends CustomBaseError {}

describe('toThrowCustomError', () => {
  it('should fail if it does not throw error', () => {
    expect(() => {
      expect(() => {}).toThrowCustomError(TestError)
    }).toThrowError(
      'Expected constructor: TestError\n\nReceived function did not throw',
    )
  })

  it('should fails if it is not target exception', () => {
    expect(() => {
      expect(() => {
        throw new Error('Not a TestError')
      }).toThrowCustomError(TestError)
    }).toThrowError(
      'Expected constructor: TestError\n\nReceived constructor: Error',
    )
  })

  it('should pass if it throws the target exception', () => {
    expect(() => {
      expect(() => {
        throw new TestError('TEST_ERROR')
      }).toThrowCustomError(TestError)
    }).not.toThrowError()
  })
})
