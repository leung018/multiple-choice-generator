import { expect } from '@jest/globals'
import type { MatcherFunction } from 'expect'
import { CustomBaseError } from '../../utils/err'
import { Newable } from '@/utils/newable'

const toThrowCustomError: MatcherFunction<
  [expectedErrorType: Newable<CustomBaseError>, expectedErrorCode?: string]
> = function (received, expectedErrorType, expectedErrorCode) {
  if (typeof received !== 'function') {
    throw new Error('This should be type function!')
  }
  const expectedConstructor = expectedErrorType.name

  let error: Error | undefined = undefined

  try {
    received()
  } catch (e) {
    if (e instanceof Error) {
      error = e
    }
  }

  if (error === undefined) {
    return {
      pass: false,
      message: () =>
        `Expected constructor: ${this.utils.printExpected(
          expectedConstructor,
        )}\nReceived function did not throw`,
    }
  }
  if (!(error instanceof expectedErrorType)) {
    return {
      pass: false,
      message: () => {
        const receivedConstructor = error?.constructor.name

        return `Expected constructor: ${this.utils.printExpected(
          expectedConstructor,
        )}\nReceived constructor: ${this.utils.printReceived(
          receivedConstructor,
        )}`
      },
    }
  }
  if (
    expectedErrorCode !== undefined &&
    error.cause.code !== expectedErrorCode
  ) {
    return {
      pass: false,
      message: () => {
        const receivedErrorCode = (error as CustomBaseError).cause.code

        return `Expected error code: "${this.utils.printExpected(
          expectedErrorCode,
        )}"\nReceived error code: "${this.utils.printReceived(
          receivedErrorCode,
        )}"`
      },
    }
  }

  return {
    pass: true,
    message: () => 'Expected thrown error',
  }
}

expect.extend({ toThrowCustomError })

declare module 'expect' {
  interface Matchers<R> {
    toThrowCustomError(
      expectedErrorType: Newable<CustomBaseError>,
      expectedCode?: string,
    ): R
  }
}
