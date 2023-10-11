import { CustomBaseError } from '../../utils/err'
import { expect } from '@jest/globals'
import './check_error'

class TestError extends CustomBaseError {}

describe('toThrowCustomError', () => {
  // Don't check the exact messages because cannot find proper way to check it after using this.utils.printExpected/printReceived
  // May not worth the effort to find a way to check the exact messages

  it('should fail if it does not throw error', () => {
    expect(() => {
      expect(() => {}).toThrowCustomError(TestError)
    }).toThrowError()
  })

  it('should fail if it is not target exception', () => {
    expect(() => {
      expect(() => {
        throw new Error('Not a TestError')
      }).toThrowCustomError(TestError)
    }).toThrowError()
  })

  it('should pass if it throws the target exception', () => {
    expect(() => {
      expect(() => {
        throw new TestError('DUMMY_CODE')
      }).toThrowCustomError(TestError)
    }).not.toThrowError()
  })

  it('should pass if it throws the target exception with expected code', () => {
    expect(() => {
      expect(() => {
        throw new TestError('TEST_CODE')
      }).toThrowCustomError(TestError, 'TEST_CODE')
    }).not.toThrowError()
  })

  it('should fail if it throws the target exception with unexpected code', () => {
    expect(() => {
      expect(() => {
        throw new TestError('UNEXPECTED_CODE')
      }).toThrowCustomError(TestError, 'EXPECTED_CODE')
    }).toThrowError()
  })
})
